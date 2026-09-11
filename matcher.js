export const WEIGHTS = {diagnosis:4, symptoms:2, breed:1, sex:1, age_diagnosis:1, weight:1};
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const supplied = value => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length);
const round = value => Math.round(value * 10000) / 10000;

function ancestors(id, data) {
  const result = new Set([id]), queue = [id];
  while (queue.length) {
    const current = queue.pop();
    for (const r of data.relationships) {
      if (r.subject === current && r.predicate === 'is_a' && !result.has(r.object)) {
        result.add(r.object);
        queue.push(r.object);
      }
    }
  }
  return result;
}

function symptomGroups(ids, data) {
  const aliases = Object.fromEntries((data.symptom_groups ?? []).flatMap(g => g.members.map(id => [id,g.id])));
  return [...new Set(ids.map(id => aliases[id] ?? id))].sort(order);
}

function compare(query, record, data, labels) {
  const f = record.features;
  let known = 0, matched = 0, requested = 0;
  const reasons = [], unknown = [];
  if (query.diagnosis) {
    const diagnoses = f.diagnoses.filter(d => ancestors(d.id, data).has(query.diagnosis) &&
      (d.certainty === 'reported' || query.include_suspected));
    if (!diagnoses.length) return null;
    known = matched = requested = WEIGHTS.diagnosis;
    reasons.push({field:'Diagnosis', status:'agreement', detail:labels[query.diagnosis],
      source_cells:[...new Set(diagnoses.map(d => d.source_cell))].sort(order),
      certainty:diagnoses.some(d => d.certainty === 'reported') ? 'reported' : 'suspected'});
  }
  for (const key of ['breed', 'sex', 'age_diagnosis', 'weight']) {
    const q = query[key];
    if (!supplied(q)) continue;
    requested += WEIGHTS[key];
    const recorded = f[key];
    if (recorded === null) { unknown.push(key); continue; }
    known += WEIGHTS[key];
    let similarity, detail;
    if (key === 'age_diagnosis') {
      similarity = Math.max(0, 1 - Math.abs(Number(q) - recorded) / 5);
      detail = recorded + ' years at diagnosis; query ' + Number(q);
    } else if (key === 'weight') {
      similarity = Math.max(0, 1 - Math.abs(Number(q) - recorded) / (Number(q) * .5));
      detail = recorded + ' lb recorded; query ' + Number(q);
    } else {
      similarity = Number(q === recorded);
      detail = labels[recorded] ?? recorded;
    }
    matched += WEIGHTS[key] * similarity;
    reasons.push({field:key, status:similarity === 1 ? 'agreement' : similarity > 0 ? 'partial' : 'difference',
      detail, source_cells:record.feature_sources[key] ?? []});
  }
  const symptoms = symptomGroups(query.symptoms ?? [], data), recordedSymptoms = symptomGroups(f.symptoms, data);
  const overlap = symptoms.filter(id => recordedSymptoms.includes(id));
  requested += WEIGHTS.symptoms * symptoms.length;
  for (const id of overlap) {
    known += WEIGHTS.symptoms;
    matched += WEIGHTS.symptoms;
    const byConcept = record.feature_sources.symptoms_by_concept;
    const sourceCells = byConcept ? [...new Set(f.symptoms.filter(specific => symptomGroups([specific], data).includes(id)).flatMap(specific => byConcept[specific] ?? []))].sort(order) : record.feature_sources.symptoms ?? [];
    reasons.push({field:'Symptom', status:'agreement', detail:labels[id] ?? id, source_cells:sourceCells});
  }
  const missing = symptoms.filter(id => !overlap.includes(id));
  if (missing.length) unknown.push('unmentioned symptoms: ' + missing.map(id => labels[id] ?? id).join(', '));
  if (!matched) return null;
  return {case_id:record.id, source_row:record.source_row, group_id:record.group_id,
    agreement:round(matched/known), coverage:round(known/requested), rank_support:matched/requested,
    shared_symptoms:overlap.length, requested_symptoms:symptoms.length, reasons, unknown};
}

function therapySupport(data) {
  const therapies = new Map(), categories = new Map(), groups = new Set();
  for (const record of data.cases) {
    groups.add(record.group_id);
    for (const t of record.interventions) {
      if (!therapies.has(t.id)) therapies.set(t.id, new Set());
      therapies.get(t.id).add(record.group_id);
      for (const id of t.categories) {
        if (!categories.has(id)) categories.set(id, new Set());
        categories.get(id).add(record.group_id);
      }
    }
  }
  return {therapies:Object.fromEntries([...therapies].map(([id,gs]) => [id,gs.size])),
    categories:Object.fromEntries([...categories].map(([id,gs]) => [id,gs.size])), case_groups:groups.size};
}

export function summarize(groups, data) {
  const cases = new Map(data.cases.map(c => [c.id, c]));
  const labels = Object.fromEntries(data.concepts.map(c => [c.id, c.label]));
  const categories = new Map(), unmapped = new Set();
  let groups_without_mapped_use = 0;
  for (const group of groups) {
    const eligible = group.records.flatMap(r => {
      const record = cases.get(r.case_id);
      record.unmatched_treatment_cells.forEach(cell => unmapped.add(cell));
      return record.interventions.map(t => ({record, t}));
    });
    if (!eligible.length) groups_without_mapped_use++;
    const cannabisDetail = eligible.some(({t}) => t.id !== 'tx.cannabis' && t.categories.includes('cat.cannabis'));
    const dietDetail = eligible.some(({t}) => ['tx.raw_diet', 'tx.homemade_diet'].includes(t.id));
    for (const {record, t} of eligible) {
      for (const id of t.categories) {
        if (!categories.has(id)) categories.set(id, {groups:new Set(), details:new Map()});
        const category = categories.get(id);
        category.groups.add(group.group_id);
        if ((t.id === 'tx.cannabis' && cannabisDetail) || (t.id === 'tx.diet_change' && dietDetail)) continue;
        if (!category.details.has(t.id)) category.details.set(t.id, {groups:new Set(), evidence:new Map()});
        const item = category.details.get(t.id);
        item.groups.add(group.group_id);
        const entry = {case_id:record.id, source_cell:t.source_cell, use_status:t.use_status};
        item.evidence.set(JSON.stringify(entry), entry);
      }
    }
  }
  const byCount = (a, b) => b.count - a.count || order(a.label, b.label);
  return {categories:[...categories].map(([id, c]) => ({id, label:labels[id], count:c.groups.size, denominator:groups.length,
    details:[...c.details].map(([id, d]) => ({id, label:labels[id], count:d.groups.size, evidence:[...d.evidence.values()]})).sort(byCount)})).sort(byCount),
    unmatched_treatment_cells:unmapped.size, groups_without_mapped_use};
}

export function match(query, data) {
  if (!Object.keys(WEIGHTS).some(k => supplied(query[k]))) {
    return {status:'insufficient_input', message:'Add any dog descriptor or symptom to find comparable cases.', groups:[], categories:[]};
  }
  for (const key of ['age_diagnosis', 'weight']) {
    if (supplied(query[key]) && !(Number(query[key]) > 0 && Number(query[key]) < 1000)) {
      return {status:'invalid_input', message:'Age and weight must be positive finite numbers.', groups:[], categories:[]};
    }
  }
  const labels = Object.fromEntries(data.concepts.map(c => [c.id, c.label]));
  const grouped = new Map();
  for (const record of data.cases) {
    const result = compare(query, record, data, labels);
    if (!result) continue;
    if (!grouped.has(result.group_id)) grouped.set(result.group_id, []);
    grouped.get(result.group_id).push(result);
  }
  const rank = (a, b) => b.rank_support - a.rank_support || b.agreement - a.agreement || b.coverage - a.coverage;
  const groups = [...grouped].map(([group_id, records]) => {
    records.sort((a, b) => rank(a, b) || a.source_row - b.source_row);
    return {group_id, records, best:records[0]};
  }).sort((a, b) => rank(a.best, b.best) || order(a.group_id, b.group_id));
  const selected = groups.slice(0, 20);
  const base = {groups:selected, qualifying_groups:groups.length, selected_groups:selected.length,
    selected_records:selected.reduce((n, g) => n + g.records.length, 0), count_unit:'provisional case groups', weights:WEIGHTS, categories:[]};
  if (!selected.length) return {...base, status:'no_matches', message:'No recorded cases share these descriptors. Try a broader condition or another descriptor.'};
  const support = therapySupport(data), summary = summarize(selected, data);
  summary.categories = summary.categories.map(c => ({...c, global_count:support.categories[c.id] ?? 0,
    details:c.details.filter(t => (support.therapies[t.id] ?? 0) >= 10).map(t => ({...t, global_count:support.therapies[t.id]}))
  })).filter(c => c.global_count >= 10);
  return {...base, ...summary, status:'ok', message:'Reported therapies with at least 10 supporting case groups across the dataset.',
    minimum_therapy_support:10, dataset_case_groups:support.case_groups, therapy_support:support.therapies,
    match_scope:query.diagnosis ? 'condition' : query.symptoms?.length ? 'symptoms' : 'general'};
}
