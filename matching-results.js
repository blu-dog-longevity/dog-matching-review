import {esc} from './questionnaire.js';
import {recordDetails} from './record-details.js';

const fieldNames = {Diagnosis:'Condition', breed:'Breed', sex:'Sex', age_diagnosis:'Age at diagnosis', weight:'Weight', Symptom:'Shared symptom'};
const counts = (count, total, global) => count+' of '+total+' matching · '+global+' overall';

function category(item, children = []) {
  const details = children.length ? children.map(c => category(c)).join('') : item.details.map(t =>
    '<li><span><a href="./index.html?side=outputs&term='+encodeURIComponent(t.id)+'&row='+Number(t.evidence[0]?.case_id.replace('pro-r',''))+'">'+esc(t.label)+'</a></span><strong>'+counts(t.count,item.denominator,t.global_count)+'</strong></li>').join('');
  return '<details class="therapy-category"><summary><span>'+esc(item.label)+'</span><strong>'+counts(item.count,item.denominator,item.global_count)+'</strong></summary>'+
    (children.length ? '<div class="therapy-children">'+details+'</div>' : '<ul class="therapy-list">'+details+'</ul>')+
    (!children.length && !item.details.length ? '<p class="question-hint category-note">This broad category has enough overall reports; the specific therapies in these matching cases are each below the 10-case minimum.</p>' : '')+'</details>';
}

function caseCard(group, data, labels, index, result) {
  const records = group.records.map(r => data.cases.find(c => c.id === r.case_id));
  const best = records.find(c => c.id === group.best.case_id), f = best.features;
  const profile = [labels[f.breed], labels[f.sex], f.age_diagnosis === null ? null : f.age_diagnosis+' years at diagnosis', f.weight === null ? null : f.weight+' lb'].filter(Boolean);
  const therapies = [...new Map(records.flatMap(c => c.interventions).map(t => [t.id, t])).values()];
  const specificCannabis = therapies.some(t => t.id !== 'tx.cannabis' && t.categories.includes('cat.cannabis'));
  const specificDiet = therapies.some(t => ['tx.raw_diet','tx.homemade_diet'].includes(t.id));
  const unique = therapies.filter(t => !(t.id === 'tx.cannabis' && specificCannabis) && !(t.id === 'tx.diet_change' && specificDiet));
  const reported = unique.filter(t => (result.therapy_support[t.id] ?? 0) >= result.minimum_therapy_support);
  const name = (records.length > 1 ? 'Linked cases ' : 'Case ') + records.map(c => c.source_row).join(' / ');
  const conditions = [...new Set(f.diagnoses.map(d => (labels[d.id] ?? d.id)+(d.certainty === 'suspected' ? ' (suspected)' : '')))];
  return '<details class="case-card"'+(index === 0 ? ' open' : '')+'><summary><span><strong>'+esc(name)+'</strong><small>'+esc(profile.join(' · ') || 'Limited profile information')+'</small></span><span class="case-score">'+Math.round(group.best.rank_support*100)+'% descriptor support</span></summary>'+
    '<div class="case-body"><p class="question-hint">Recorded condition: '+esc(conditions.join(', ') || 'Not recorded')+'</p><h4>Therapies reported used</h4><div class="reported-therapies">'+
    (reported.length ? reported.map(t => '<span class="therapy-chip">'+esc(labels[t.id] ?? t.id)+' <small>('+result.therapy_support[t.id]+' overall)</small></span>').join('') : '<p class="question-hint">No reported therapy in this case meets the overall 10-case minimum.</p>')+'</div>'+
    (unique.length > reported.length ? '<p class="question-hint">'+(unique.length-reported.length)+' less-supported therapy '+(unique.length-reported.length === 1 ? 'report is' : 'reports are')+' omitted here. The source records are retained.</p>' : '')+
    '<details class="case-structure"><summary>Observations, linked product details and timeline</summary>'+records.map(c=>'<p class="record-scope">Report '+c.source_row+' · '+(c.structure?.reviewed?'Selected relationships reviewed':'Partial mapping')+'</p>'+recordDetails(c,{groups:data.symptom_groups,allowed:Object.keys(result.therapy_support).filter(id=>result.therapy_support[id]>=result.minimum_therapy_support)})).join('')+'</details>'+
    '<details class="match-reasons"><summary>Why this case matched</summary><ul>'+group.best.reasons.map(r => '<li><strong>'+esc(fieldNames[r.field] ?? r.field)+':</strong> '+esc(r.detail)+(r.status === 'difference' ? ' (different)' : r.status === 'partial' ? ' (partial match)' : '')+(r.certainty === 'suspected' ? ' (suspected)' : '')+'</li>').join('')+'</ul><p class="question-hint">'+group.best.shared_symptoms+' of '+group.best.requested_symptoms+' selected symptoms recorded. '+Math.round(group.best.coverage*100)+'% of requested information was comparable.</p>'+
    (group.best.unknown.length ? '<p class="question-hint">Unknown: '+esc(group.best.unknown.join('; ').replaceAll('_',' '))+'</p>' : '')+'</details>'+
    (records.length > 1 ? '<p class="question-hint">These records are provisionally linked and count once. Only matching records contribute therapies.</p>' : '')+'</div></details>';
}

export function renderMatches(root, result, data) {
  const labels = Object.fromEntries(data.concepts.map(c => [c.id, c.label]));
  if (['insufficient_input','invalid_input'].includes(result.status)) {
    root.innerHTML = '<div class="match-notice"><h2>Start with what you know</h2><p>'+esc(result.message)+'</p></div>';
    return;
  }
  const count = result.selected_groups;
  root.innerHTML = '<section class="match-overview"><p class="result-label">MATCHING RESULTS</p><h2>'+count+' comparable case '+(count === 1 ? 'group' : 'groups')+'</h2><p>'+
    (result.match_scope === 'general' ? 'A general comparison within the PRO collection. Add a known diagnosis or symptoms to refine relevance.' : 'Historical PRO reports with similar recorded characteristics; some have no named cancer diagnosis.')+'</p>'+
    (result.qualifying_groups > count ? '<p class="question-hint">Showing the closest '+count+' of '+result.qualifying_groups+' groups sharing information with this profile.</p>' : '')+'</section>'+
    (result.status === 'ok' ? '<section class="therapy-summary"><h3>Reported therapies</h3><p class="question-hint">Each output has at least 10 supporting case groups across all '+result.dataset_case_groups+' groups. One matching case is enough to include it here. Counts show matching cases and overall reports separately.</p>'+
      result.categories.filter(c => !['cat.cannabis','cat.botanical'].includes(c.id)).map(c => category(c, c.id === 'cat.plant' ? result.categories.filter(c => ['cat.cannabis','cat.botanical'].includes(c.id)) : [])).join('')+
      (!result.categories.length ? '<p>No therapy outputs meet the overall minimum for these matching cases.</p>' : '')+
      '<p class="question-hint">Counts describe reported use, not effectiveness. Categories overlap. '+result.unmatched_treatment_cells+' populated treatment cells in these cases have no mapped therapy; other cells may retain unmapped detail.</p></section>' :
      '<p class="match-notice">'+esc(result.message)+'</p>')+
    (count ? '<section class="matched-cases"><h3>Cases and their therapies</h3><details class="scoring-explanation"><summary>How matching works</summary><p>Known diagnosis: 4 points. Each distinct symptom: 2 points. Breed, sex, age at diagnosis and weight: 1 point each. Age and weight allow partial matches. Cases rank by supported points divided by the points you supplied.</p><p>A diagnosis is optional; when supplied, cases must match that diagnosis. Other details refine the ranking without a percentage cutoff. Unrecorded symptoms stay unknown. Severity and symptom-combination bonuses are not scored.</p></details><p class="question-hint">Descriptor support measures recorded similarity, not confidence or a probability. Names are omitted; some records may describe the same dog.</p>'+result.groups.map((g,i) => caseCard(g,data,labels,i,result)).join('')+'</section>' : '');
}
