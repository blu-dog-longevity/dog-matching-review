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
  const symptom = q => '<div class="symptom-item"><label class="symptom-check"><input type="checkbox" name="observed" value="'+q.id+'"><span>'+esc(q.label)+'</span></label>'+
    '<fieldset class="severity-row" data-severity="'+q.id+'" hidden><legend>Severity (optional)</legend><div class="severity-choices">'+
    schema.severity_choices.map((label,i) => '<label title="'+esc(label)+'"><input type="radio" name="severity-'+q.id+'" value="'+(i+1)+'" aria-label="'+esc(q.label)+' severity '+(i+1)+' — '+esc(label)+'"><span>'+(i+1)+'</span></label>').join('')+
    '<label class="relieved"><input type="radio" name="severity-'+q.id+'" value="0" aria-label="'+esc(q.label)+' relieved"><span>Relieved</span></label></div><small>1 mild · 5 very severe</small></fieldset></div>';
  root.innerHTML = '<section class="form-section"><h2>About your dog</h2><p class="question-hint">Start with anything you know. Every field is optional; results refine as you add details.</p>'+
    '<label for="dog-name">Dog’s name <span class="optional">(optional)</span></label><input id="dog-name" autocomplete="off" placeholder="Example dog">'+
    '<label for="breed">Breed</label><select id="breed"><option value="">Not sure / leave blank</option>'+choices(options.breed)+'</select>'+
    '<div class="profile-pair"><div><label for="weight">Weight</label><input id="weight" type="number" min="0.1" max="400" step="0.1" placeholder="Pounds"></div>'+
    '<div><label for="sex">Sex</label><select id="sex"><option value="">Leave blank</option><option value="sex.female">Female</option><option value="sex.male">Male</option></select></div></div>'+
    '<label for="diagnosis">Cancer / reported diagnosis <span class="optional">(if known)</span></label><select id="diagnosis"><option value="">Not sure / leave blank</option>'+choices(options.diagnosis)+'</select>'+
    '<label for="age">Age at diagnosis <span class="optional">(if known)</span></label><input id="age" type="number" min="0.1" max="50" step="0.1" placeholder="Years at diagnosis, not current age">'+
    '<label class="plain-check"><input id="suspected" type="checkbox">Include cases with suspected diagnoses</label></section>'+
    '<section class="form-section"><h2>Symptoms you’ve noticed</h2><p class="question-hint">Check what is present. A cancer diagnosis is optional. Historical observations can come from symptom, treatment or follow-up reports.</p><label for="symptom-context">Compare with symptom reports from <span class="optional">(optional)</span></label><select id="symptom-context"><option value="any">Any reported context</option><option value="treatment">Treatment-related reports</option><option value="cannabis">Cannabis-related reports</option><option value="follow_up">Follow-up reports</option></select><p class="question-hint">This refines symptom evidence, not the diagnosis filter. Reported context does not establish cause.</p><div class="symptom-checks">'+
    schema.checkboxes.filter(q => q.source === 'existing_platform').map(symptom).join('')+'</div></section>'+
    '<details class="form-section extra-symptoms"><summary>Additional signs from the PRO reports</summary><p class="question-hint">Proposed new questions: these are not in the existing BLU Dog intake. You can try them in this prototype.</p><div class="symptom-checks">'+
    schema.checkboxes.filter(q => q.source === 'proposed_question').map(symptom).join('')+'</div></details>'+
    '<section class="stool-pending"><h3>Stool information</h3><p>Diarrhea and loose-stool matching will use the BLU Dog poop app. That connection is not covered in this prototype yet.</p></section>'+
    '<details class="coverage-notes"><summary>Questions and findings not used for symptom matching</summary><p class="question-hint">These have no usable symptom mapping yet, or belong to a different kind of observation:</p><ul>'+schema.uncovered.map(q => '<li>'+esc(q.label)+'</li>').join('')+'</ul><p class="question-hint">Laboratory findings, diagnosis episodes and linked treatment details can be explored in Source breakdown. Mapping remains partial. <a href="./INPUT-ALIGNMENT.md">Full question alignment</a></p></details>';
  root.addEventListener('change', () => syncSeverity(root));
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
  return {dog_name:value('dog-name').trim(), diagnosis:value('diagnosis'), breed:value('breed'),
    age_diagnosis:value('age') ? Number(value('age')) : null,
    weight:value('weight') ? Number(value('weight')) : null, sex:value('sex'),
    symptom_context:value('symptom-context'),
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
  const values = {'dog-name':'Example dog', diagnosis:'cancer.lymphoma', breed:'', age:'8', weight:'', sex:'sex.male', 'symptom-context':'any'};
  for (const [id,value] of Object.entries(values)) root.querySelector('#'+id).value = value;
  for (const id of ['sign.low_energy','sign.enlarged_lymph_nodes']) {
    root.querySelector('input[name=observed][value="'+id+'"]').checked = true;
    root.querySelector('input[name="severity-'+id+'"][value="2"]').checked = true;
  }
  syncSeverity(root);
  root.dispatchEvent(new Event('change', {bubbles:true}));
}
