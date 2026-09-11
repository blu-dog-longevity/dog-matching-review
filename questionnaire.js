export const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function deriveSymptoms(answers, schema) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('Answers must be an object.');
  const checked = answers.checked ?? [], severities = answers.severities ?? {};
  if (!Array.isArray(checked) || !severities || typeof severities !== 'object' || Array.isArray(severities)) throw new Error('Provide checked symptoms and optional severity answers.');
  const ids = new Set(schema.checkboxes.map(q => q.id));
  if (checked.some(id => !ids.has(id)) || Object.keys(severities).some(id => !ids.has(id))) throw new Error('Unknown symptom question.');
  if (Object.keys(answers).some(key => !['checked','severities'].includes(key))) throw new Error('Answers do not match the current questionnaire version.');
  if (Object.values(severities).some(n => n !== null && (!Number.isInteger(n) || n < 0 || n > 5))) throw new Error('Choose a whole-number severity from 0 to 5.');
  const decisions = schema.checkboxes.map(q => {
    const selected = checked.includes(q.id), severity = selected ? severities[q.id] ?? null : null;
    const label = !selected ? 'Not checked' : severity === null ? 'Present; severity not supplied' : severity === 0 ? '0 — Relieved' : severity+' — '+schema.severity_choices[severity-1];
    return {question_id:q.id, symptom_id:q.symptom_id, label:q.symptom_label,
      answer:severity ?? (selected ? true : null), answer_label:label, flag:selected ? severity !== 0 : null,
      rule:'Checked or severity 1–5 → present; 0 → relieved.', source:q.source};
  });
  return {version:schema.version, timeframe:schema.timeframe,
    answers:{checked:[...new Set(checked)], severities:Object.fromEntries([...new Set(checked)].map(id => [id,severities[id] ?? null]))},
    symptoms:[...new Set(decisions.filter(d => d.flag === true).map(d => d.symptom_id))],
    decisions, stool:{source:'poop_app', status:'not_connected', symptoms:[]}};
}

export function renderDogForm(root, schema, options = schema.profile_options) {
  const choices = entries => entries.map(c => '<option value="'+esc(c.id)+'">'+esc(c.label)+'</option>').join('');
  const diagnosisIds = new Set(options.diagnosis.map(c => c.id));
  const roots = options.diagnosis.filter(c => !diagnosisIds.has(schema.diagnosis_parents[c.id]));
  const symptom = q => '<div class="symptom-item"><label class="symptom-check"><input type="checkbox" name="observed" value="'+q.id+'"><span>'+esc(q.label)+'</span></label>'+
    '<fieldset class="severity-row" data-severity="'+q.id+'" hidden><legend>Severity (optional)</legend><div class="severity-choices">'+
    schema.severity_choices.map((label,i) => '<label title="'+esc(label)+'"><input type="radio" name="severity-'+q.id+'" value="'+(i+1)+'" aria-label="'+esc(q.label)+' severity '+(i+1)+' — '+esc(label)+'"><span>'+(i+1)+'</span></label>').join('')+
    '<label class="relieved"><input type="radio" name="severity-'+q.id+'" value="0" aria-label="'+esc(q.label)+' relieved"><span>Relieved</span></label></div><small>1 mild · 5 very severe</small></fieldset></div>';
  root.innerHTML = '<section class="form-section"><h2>About your dog</h2><p class="question-hint">Start with anything you know. Every field is optional; results refine as you add details.</p>'+
    '<label for="dog-name">Dog’s name <span class="optional">(optional)</span></label><input id="dog-name" autocomplete="off" placeholder="Example dog">'+
    '<label for="breed">Breed</label><select id="breed"><option value="">Not sure / leave blank</option>'+choices(options.breed)+'</select>'+
    '<div class="profile-pair"><div><label for="weight">Weight</label><input id="weight" type="number" min="0.1" max="400" step="0.1" placeholder="Pounds"></div>'+
    '<div><label for="sex">Sex</label><select id="sex"><option value="">Leave blank</option><option value="sex.female">Female</option><option value="sex.male">Male</option></select></div></div>'+
    '<label for="condition">Diagnosis <span class="optional">(if known)</span></label><select id="condition"><option value="">Not sure / leave blank</option>'+choices(roots)+'</select><div id="diagnosis-details"></div>'+
    '<label for="age">Age at diagnosis <span class="optional">(if known)</span></label><input id="age" type="number" min="0.1" max="50" step="0.1" placeholder="Years at diagnosis, not current age">'+
    '<label class="plain-check"><input id="suspected" type="checkbox">Include cases with suspected diagnoses</label></section>'+
    '<section class="form-section"><h2>Starting symptoms</h2><p class="question-hint">Symptoms the dog already had before treatment, even if the cause is unknown. Leave out treatment side effects and later changes. Severity is optional.</p><div class="symptom-checks">'+
    schema.checkboxes.filter(q => q.source === 'existing_platform').map(symptom).join('')+'</div></section>'+
    '<details class="form-section extra-symptoms"><summary>Additional signs from the PRO reports</summary><p class="question-hint">Proposed new questions: these are not in the existing BLU Dog intake. You can try them in this prototype.</p><div class="symptom-checks">'+
    schema.checkboxes.filter(q => q.source === 'proposed_question').map(symptom).join('')+'</div></details>'+
    '<section class="stool-pending"><h3>Stool information</h3><p>Diarrhea and loose-stool matching will use the BLU Dog poop app. That connection is not covered in this prototype yet.</p></section>'+
    '<details class="coverage-notes"><summary>Questions not covered yet</summary><p class="question-hint">These existing questions have no reviewed starting-symptom mapping:</p><ul>'+schema.uncovered.map(q => '<li>'+esc(q.label)+'</li>').join('')+'</ul><p class="question-hint">Treatment reactions are reserved for later follow-ups. Lab findings are kept separately from symptom choices. <a href="./INPUT-ALIGNMENT.md">Full question alignment</a></p></details>';
  root.addEventListener('change', event => {
    if (event.target.id === 'condition' || event.target.matches('[data-diagnosis-level]')) {
      const path = event.target.id === 'condition' ? [] : [...root.querySelectorAll('[data-diagnosis-level]')].slice(0, Number(event.target.dataset.diagnosisLevel)+1).map(select => select.value);
      renderDiagnosisDetails(root, options.diagnosis, schema.diagnosis_parents, path);
    }
    syncSeverity(root);
  });
}

function renderDiagnosisDetails(root, diagnoses, parents, path) {
  let parent = root.querySelector('#condition').value, depth = 0, html = '';
  while (parent) {
    const children = diagnoses.filter(c => parents[c.id] === parent);
    if (!children.length) break;
    const selected = children.some(c => c.id === path[depth]) ? path[depth] : '';
    const id = depth === 0 ? 'diagnosis' : 'diagnosis-subtype-'+depth;
    html += '<label for="'+id+'">'+(depth === 0 ? 'Type' : 'Subtype')+' <span class="optional">(if known)</span></label><select id="'+id+'" data-diagnosis-level="'+depth+'"><option value="">Not specified / keep broader match</option>'+children.map(c => '<option value="'+esc(c.id)+'"'+(c.id === selected ? ' selected' : '')+'>'+esc(c.label)+'</option>').join('')+'</select>';
    parent = selected;
    depth++;
  }
  root.querySelector('#diagnosis-details').innerHTML = html;
}

function syncSeverity(root) {
  for (const input of root.querySelectorAll('input[name=observed]')) {
    const field = root.querySelector('[data-severity="'+input.value+'"]');
    field.hidden = !input.checked;
    if (!input.checked) field.querySelectorAll('input').forEach(radio => radio.checked = false);
  }
}

export function readAnswers(root) {
  const checked = [...root.querySelectorAll('input[name="observed"]:checked')].map(input => input.value);
  return {checked, severities:Object.fromEntries(checked.map(id => {
    const selected = root.querySelector('input[name="severity-'+id+'"]:checked');
    return [id,selected ? Number(selected.value) : null];
  }))};
}

export function readProfile(root) {
  const value = id => root.querySelector('#'+id).value;
  const diagnosis = [value('condition'), ...[...root.querySelectorAll('[data-diagnosis-level]')].map(select => select.value)].filter(Boolean).at(-1) ?? '';
  return {dog_name:value('dog-name').trim(), diagnosis, breed:value('breed'),
    age_diagnosis:value('age') ? Number(value('age')) : null,
    weight:value('weight') ? Number(value('weight')) : null, sex:value('sex'),
    include_suspected:root.querySelector('#suspected').checked};
}

export function renderTranslation(root, result) {
  const positive = result.decisions.filter(d => d.flag === true);
  root.innerHTML = '<h2>Symptoms used for matching</h2><div class="derived-symptoms">'+
    (positive.length ? positive.map(d => '<span class="derived-chip">'+esc(d.label)+'</span>').join('') : '<p class="question-hint">No symptoms selected. General descriptors can still find cases.</p>')+'</div>'+
    '<details class="conversion-rules"><summary>How your answers are used</summary><p class="question-hint">Each selected symptom counts once. Severity is saved for later integration; the old reports do not have comparable severity scores. Relieved symptoms are not added. Unchecked symptoms stay unknown.</p>'+
    result.decisions.filter(d => d.flag !== null).map(d => '<div class="conversion-row"><strong>'+esc(d.label)+'</strong><span>'+esc(d.answer_label)+' → '+(d.flag ? 'Used for matching' : 'Not added')+'</span></div>').join('')+'</details>';
}

export function loadExample(root) {
  root.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(input => input.checked = false);
  const values = {'dog-name':'Example dog', condition:'cancer.any', breed:'', age:'8', weight:'', sex:'sex.male'};
  for (const [id,value] of Object.entries(values)) root.querySelector('#'+id).value = value;
  root.querySelector('#condition').dispatchEvent(new Event('change', {bubbles:true}));
  root.querySelector('#diagnosis').value = 'cancer.lymphoma';
  root.querySelector('#diagnosis').dispatchEvent(new Event('change', {bubbles:true}));
  for (const id of ['sign.low_energy','sign.enlarged_lymph_nodes']) {
    root.querySelector('input[name=observed][value="'+id+'"]').checked = true;
    root.querySelector('input[name="severity-'+id+'"][value="2"]').checked = true;
  }
  syncSeverity(root);
  root.dispatchEvent(new Event('change', {bubbles:true}));
}
