export const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function deriveSymptoms(answers, schema) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('Answers must be an object.');
  const scales = answers.scales ?? {};
  const checked = answers.checked ?? [];
  if (!scales || typeof scales !== 'object' || Array.isArray(scales)) throw new Error('Scale answers must be an object.');
  if (!Array.isArray(checked)) throw new Error('Checked symptoms must be a list.');
  const scaleIds = new Set(schema.scales.map(q => q.id));
  const checkIds = new Set(schema.checkboxes.map(q => q.id));
  if (Object.keys(scales).some(id => !scaleIds.has(id))) throw new Error('Unknown scale question.');
  if (checked.some(id => !checkIds.has(id))) throw new Error('Unknown checkbox symptom.');
  const decisions = schema.scales.map(q => {
    const answer = scales[q.id] ?? null;
    if (answer !== null && (!Number.isInteger(answer) || answer < 1 || answer > 5)) throw new Error('Choose a whole-number answer from 1 to 5.');
    return {question_id:q.id, symptom_id:q.symptom_id, label:q.symptom_label, answer,
      answer_label:answer === null ? 'Skipped' : answer + ' — ' + q.choices[answer-1],
      flag:answer === null ? null : q.present_values.includes(answer),
      rule:q.present_values.join(', ') + ' → ' + q.symptom_label};
  });
  for (const q of schema.checkboxes) {
    const selected = checked.includes(q.id);
    decisions.push({question_id:q.id, symptom_id:q.symptom_id, label:q.symptom_label,
      answer:selected ? true : null, answer_label:selected ? 'Checked' : 'Not checked',
      flag:selected ? true : null, rule:'Checked → ' + q.symptom_label});
  }
  return {version:schema.version, timeframe:schema.timeframe,
    answers:{scales:Object.fromEntries(schema.scales.map(q => [q.id, scales[q.id] ?? null])), checked:[...new Set(checked)]},
    symptoms:[...new Set(decisions.filter(d => d.flag === true).map(d => d.symptom_id))],
    decisions, stool:{source:'poop_app', status:'not_connected', symptoms:[]}};
}

export function renderDogForm(root, schema, options = schema.profile_options) {
  const choices = entries => entries.map(c => '<option value="'+esc(c.id)+'">'+esc(c.label)+'</option>').join('');
  root.innerHTML = '<section class="form-section"><h2>About your dog</h2><p class="question-hint">Use an example dog for this review.</p>'+
    '<label for="dog-name">Dog’s name <span class="optional">(optional)</span></label><input id="dog-name" autocomplete="off" placeholder="Example dog">'+
    '<label for="diagnosis">Reported condition</label><select id="diagnosis"><option value="">Choose a condition</option>'+choices(options.diagnosis)+'</select>'+
    '<label for="breed">Breed</label><select id="breed"><option value="">Not sure / leave blank</option>'+choices(options.breed)+'</select>'+
    '<div class="profile-pair"><div><label for="age">Age at diagnosis</label><input id="age" type="number" min="0.1" max="50" step="0.1" placeholder="Years"></div>'+
    '<div><label for="weight">Recorded weight</label><input id="weight" type="number" min="0.1" max="400" step="0.1" placeholder="Pounds"></div></div>'+
    '<label for="sex">Sex</label><select id="sex"><option value="">Not sure / leave blank</option><option value="sex.female">Female</option><option value="sex.male">Male</option></select>'+
    '<label class="plain-check"><input id="suspected" type="checkbox">Include cases with suspected diagnoses</label></section>'+
    '<section class="form-section"><h2>Day to day</h2><p class="question-hint">Think about the past 7 days. Skip anything you’re not sure about.</p>'+
    schema.scales.map(q => '<fieldset class="scale-question"><legend>'+esc(q.label)+'</legend><div class="scale-choices">'+q.choices.map((label,i) =>
      '<label class="scale-option"><input type="radio" name="scale-'+esc(q.id)+'" value="'+(i+1)+'"><span><strong>'+(i+1)+'</strong><small>'+esc(label)+'</small></span></label>'
    ).join('')+'</div><button type="button" class="skip-question" data-skip="'+q.id+'">Not sure / skip</button></fieldset>').join('')+'</section>'+
    '<section class="form-section"><h2>Signs you’ve noticed</h2><p class="question-hint">Check any you’ve noticed in the past 7 days. Unchecked items won’t add a symptom.</p><div class="symptom-checks">'+
    schema.checkboxes.map(q => '<label class="symptom-check"><input type="checkbox" name="observed" value="'+q.id+'"><span>'+esc(q.label)+'</span></label>').join('')+'</div></section>'+
    '<section class="stool-pending"><h3>Stool information</h3><p>This will come from the BLU Dog poop app once it is connected. Stool consistency is not used in this prototype yet.</p></section>';
  root.addEventListener('click', event => {
    const skip = event.target.closest('[data-skip]');
    if (!skip) return;
    root.querySelectorAll('input[name="scale-'+skip.dataset.skip+'"]').forEach(input => input.checked = false);
    root.dispatchEvent(new Event('change', {bubbles:true}));
  });
}

export function readAnswers(root, schema) {
  return {scales:Object.fromEntries(schema.scales.map(q => {
    const selected = root.querySelector('input[name="scale-'+q.id+'"]:checked');
    return [q.id, selected ? Number(selected.value) : null];
  })), checked:[...root.querySelectorAll('input[name="observed"]:checked')].map(input => input.value)};
}

export function readProfile(root) {
  const value = id => root.querySelector('#'+id).value;
  return {dog_name:value('dog-name').trim(), diagnosis:value('diagnosis'), breed:value('breed'),
    age_diagnosis:value('age') ? Number(value('age')) : null,
    weight:value('weight') ? Number(value('weight')) : null, sex:value('sex'),
    include_suspected:root.querySelector('#suspected').checked};
}

export function renderTranslation(root, result) {
  const positive = result.decisions.filter(d => d.flag === true);
  root.innerHTML = '<h2>Symptoms for matching</h2><div class="derived-symptoms" aria-live="polite">'+
    (positive.length ? positive.map(d => '<span class="derived-chip">'+esc(d.label)+'</span>').join('') : '<p class="question-hint">No symptoms added yet.</p>')+'</div>'+
    '<p class="question-hint">Skipped questions and unchecked signs stay unknown. Answers that don’t flag a symptom aren’t used as evidence of absence in the old records.</p>'+
    '<details class="conversion-rules"><summary>How the answers translate</summary><p class="question-hint">Draft rules for team review. Each 1–5 question has its own meaning.</p>'+
    '<div class="conversion-rows">'+result.decisions.filter(d => !d.question_id.startsWith('sign.') || d.flag === true).map(d =>
      '<div class="conversion-row"><strong>'+esc(d.label)+'</strong><span>'+esc(d.answer_label)+' → '+(d.flag === null ? 'Unknown' : d.flag ? 'Add symptom' : 'Not flagged')+'</span><small>'+esc(d.rule)+'</small></div>'
    ).join('')+'</div></details>';
}

export function loadExample(root, schema) {
  root.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(input => input.checked = false);
  const values = {'dog-name':'Example dog', diagnosis:'cancer.lymphoma', breed:'', age:'8', weight:'', sex:'sex.male'};
  for (const [id,value] of Object.entries(values)) root.querySelector('#'+id).value = value;
  for (const [id,value] of Object.entries({energy:2,anxiety:1,appetite:3,mobility:5})) {
    root.querySelector('input[name="scale-'+id+'"][value="'+value+'"]').checked = true;
  }
  root.querySelector('input[name=observed][value="sign.enlarged_lymph_nodes"]').checked = true;
  root.dispatchEvent(new Event('change', {bubbles:true}));
}
