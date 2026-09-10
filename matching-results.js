import {esc} from './questionnaire.js';

const fieldNames = {Diagnosis:'Condition', breed:'Breed', sex:'Sex', age_diagnosis:'Age at diagnosis', weight:'Weight', 'Cancer-context symptoms':'Shared symptoms'};

function category(item, children = []) {
  const details = children.length ? children.map(c => category(c)).join('') : item.details.map(t =>
    '<li><span>'+esc(t.label)+'</span><strong>'+t.count+' of '+item.denominator+'</strong></li>').join('');
  return '<details class="therapy-category"><summary><span>'+esc(item.label)+'</span><strong>'+item.count+' of '+item.denominator+'</strong></summary>'+
    (children.length ? '<div class="therapy-children">'+details+'</div>' : '<ul class="therapy-list">'+details+'</ul>')+'</details>';
}

function caseCard(group, data, labels, index) {
  const records = group.records.map(r => data.cases.find(c => c.id === r.case_id));
  const best = records.find(c => c.id === group.best.case_id);
  const f = best.features;
  const profile = [labels[f.breed], labels[f.sex], f.age_diagnosis === null ? null : f.age_diagnosis+' years at diagnosis', f.weight === null ? null : f.weight+' lb'].filter(Boolean);
  const therapies = [...new Map(records.flatMap(c => c.interventions).map(t => [t.id, t])).values()];
  const specificCannabis = therapies.some(t => t.id !== 'tx.cannabis' && t.categories.includes('cat.cannabis'));
  const specificDiet = therapies.some(t => ['tx.raw_diet','tx.homemade_diet'].includes(t.id));
  const reported = therapies.filter(t => !(t.id === 'tx.cannabis' && specificCannabis) && !(t.id === 'tx.diet_change' && specificDiet));
  const name = (records.length > 1 ? 'Linked cases ' : 'Case ') + records.map(c => c.source_row).join(' / ');
  return '<details class="case-card"'+(index === 0 ? ' open' : '')+'><summary><span><strong>'+esc(name)+'</strong><small>'+esc(profile.join(' · ') || 'Limited profile information')+'</small></span><span class="case-score">'+Math.round(group.best.agreement*100)+'% agreement</span></summary>'+
    '<div class="case-body"><h4>Therapies reported used</h4><div class="reported-therapies">'+
    (reported.length ? reported.map(t => '<span class="therapy-chip">'+esc(labels[t.id] ?? t.id)+'</span>').join('') : '<p class="question-hint">No mapped therapy-use report is available for this case.</p>')+'</div>'+
    '<details class="match-reasons"><summary>Why this case matched</summary><ul>'+group.best.reasons.map(r => '<li><strong>'+esc(fieldNames[r.field] ?? r.field)+':</strong> '+esc(r.detail)+(r.certainty === 'suspected' ? ' (suspected)' : '')+'</li>').join('')+'</ul><p class="question-hint">'+Math.round(group.best.coverage*100)+'% of the requested information was comparable. Unrecorded symptoms stay unknown.</p></details>'+
    (records.length > 1 ? '<p class="question-hint">These records are provisionally linked and count once. Only matching records contribute therapies.</p>' : '')+'</div></details>';
}

export function renderMatches(root, result, data) {
  const labels = Object.fromEntries(data.concepts.map(c => [c.id, c.label]));
  if (['insufficient_input','invalid_input'].includes(result.status)) {
    root.innerHTML = '<div class="match-notice"><h2>Add a little more information</h2><p>'+esc(result.message)+'</p></div>';
    return;
  }
  const count = result.selected_groups;
  root.innerHTML = '<section class="match-overview"><p class="result-label">MATCHING RESULTS</p><h2>'+count+' comparable case '+(count === 1 ? 'group' : 'groups')+'</h2><p>Historical dog records with similar recorded characteristics. Names are omitted; some records may describe the same dog.</p></section>'+
    (result.status === 'ok' ? '<section class="therapy-summary"><h3>Most reported therapies</h3><p class="question-hint">Expand a group to see the therapies reported in these '+count+' case groups. Categories overlap; reported use does not establish effectiveness.</p>'+
      result.categories.filter(c => !['cat.cannabis','cat.botanical'].includes(c.id)).map(c => category(c, c.id === 'cat.plant' ? result.categories.filter(c => ['cat.cannabis','cat.botanical'].includes(c.id)) : [])).join('')+
      '<p class="question-hint">Mapping is incomplete. '+result.unmatched_treatment_cells+' populated treatment cells in these cases have no mapped therapy; other cells may retain unmapped detail.</p></section>' :
      '<p class="match-notice">'+esc(result.message)+'</p>')+
    (count ? '<section class="matched-cases"><h3>Comparable cases and their therapies</h3><p class="question-hint">Open a case to see its reported therapies and matching reasons. Agreement describes comparable information, not a probability.</p>'+result.groups.map((g,i) => caseCard(g,data,labels,i)).join('')+'</section>' : '<p>Try a broader reported condition or leave uncertain profile details blank.</p>');
}
