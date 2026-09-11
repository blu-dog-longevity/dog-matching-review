import {esc} from './questionnaire.js';

const refs = cells => '<small class="record-refs">Excel '+cells.map(esc).join(', ')+'</small>';
const alias = (id, groups) => groups.find(g => g.members.includes(id))?.id ?? id;

export function recordDetails(record, {side='all', selected=null, groups=[], allowed=null}={}) {
  const s = record.structure;
  if (!s) return '';
  const selectedObservations = s.observations.filter(o => !selected || alias(o.id,groups) === selected);
  const observations = side === 'outputs' ? [] : selectedObservations.length ? selectedObservations : s.observations;
  const treatments = s.treatments.filter(t => (!allowed || allowed.includes(t.concept_id)) &&
    (side !== 'outputs' || !selected || selected === 'tx.cannabis' || t.concept_id === selected));
  const conditions = s.conditions.map(c => '<div class="record-line"><strong>'+esc(c.label)+'</strong><span>'+esc(c.period)+' · '+esc(c.certainty)+'</span>'+refs(c.source_cells)+'</div>').join('');
  const observationHTML = observations.map(o => '<div class="record-line"><strong>'+esc(o.label)+' <span class="record-badge">'+(o.kind === 'finding' ? 'Finding' : 'Observation')+'</span></strong><span>'+esc(o.context_label)+'</span><span>'+esc(o.timing)+(o.attributed_to ? ' · Source links this to '+esc(o.attributed_to) : '')+'</span>'+refs(o.source_cells)+'</div>').join('');
  const treatmentHTML = treatments.map(t => '<article class="record-product"><h4>'+esc(t.label)+'</h4><p class="record-status">'+esc(t.status)+'</p>'+refs(t.source_cells)+
    (t.details.length ? '<dl>'+t.details.map(d => '<div><dt>'+esc(d.kind)+'</dt><dd>'+esc(d.value)+'<small class="'+(d.status === 'Unresolved' ? 'record-uncertain' : '')+'">'+esc(d.status)+'</small>'+refs(d.source_cells)+'</dd></div>').join('')+'</dl>' : '<p class="record-muted">Product-specific composition, route and dose have not been linked.</p>')+'</article>').join('');
  let html = '<div class="record-structure">';
  const conditionHTML = '<div class="record-section"><h3>Condition and time</h3>'+(conditions || '<p class="record-muted">No named diagnosis mapped. Reported symptoms are still retained.</p>')+'</div>';
  if (side === 'all') html += conditionHTML;
  if (observationHTML) html += '<div class="record-section"><h3>What was observed</h3>'+observationHTML+'</div>';
  if (side === 'inputs') html += conditionHTML;
  if (side !== 'inputs') {
    html += '<div class="record-section"><h3>What was used'+(side === 'outputs' ? ' · this report' : '')+'</h3>'+(treatmentHTML || '<p class="record-muted">No eligible used treatment is mapped for this selection. Source wording may describe a declined or uncertain treatment.</p>')+'</div>';
    if (s.unlinked_details.length) html += '<p class="record-muted">Additional cannabis details are recorded but not fully linked: '+s.unlinked_details.map(d => esc(d.kind)+' ('+d.source_cells.map(esc).join(', ')+')').join(' · ')+'.</p>';
    if (side === 'outputs') html += '<details class="record-timeline"><summary>Condition and time for this report</summary>'+conditionHTML+'</details>';
  }
  if (s.outcomes.length) html += '<details class="record-timeline"><summary>What was reported afterward</summary>'+s.outcomes.map(o => '<div class="record-line"><strong>'+esc(o.time)+'</strong><span>'+esc(o.label)+'</span>'+refs(o.source_cells)+'</div>').join('')+'<p class="record-muted">These are reported changes; they do not establish which treatment caused them.</p></details>';
  if (s.notes.length) html += '<details class="record-timeline"><summary>Source details to review</summary><ul class="record-notes">'+s.notes.map(n => '<li>'+esc(n)+'</li>').join('')+'</ul></details>';
  return html+'</div>';
}
