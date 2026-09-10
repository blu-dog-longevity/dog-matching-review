import {renderDogForm, readAnswers, readProfile, deriveSymptoms, renderTranslation, loadExample} from './questionnaire.js';
import {match} from './matcher.js';
import {renderMatches} from './matching-results.js';

const $ = id => document.getElementById(id);
try {
  const responses = await Promise.all([fetch('./questionnaire.json'), fetch('./matching-cases.json')]);
  if (responses.some(r => !r.ok)) throw new Error('The questions or matching records could not be loaded. Please reload the page.');
  const [schema, data] = await Promise.all(responses.map(r => r.json()));
  let hasResults = false;
  renderDogForm($('dog-fields'), schema);
  const assessment = () => deriveSymptoms(readAnswers($('query'), schema), schema);
  const update = () => {
    renderTranslation($('translation'), assessment());
    if (hasResults) {
      $('matching-results').innerHTML = '<div class="results-placeholder"><h2>Answers updated</h2><p>Select Find matching cases again to refresh the results.</p></div>';
      hasResults = false;
    }
  };
  $('query').addEventListener('input', update);
  $('query').addEventListener('change', update);
  $('query').addEventListener('submit', event => {
    event.preventDefault();
    const translated = assessment();
    const result = match({...readProfile($('query')), symptoms:translated.symptoms}, data);
    renderMatches($('matching-results'), result, data);
    hasResults = true;
    $('matching-results').focus({preventScroll:true});
    $('matching-results').scrollIntoView({behavior:'smooth', block:'start'});
  });
  $('example').addEventListener('click', () => {
    loadExample($('query'), schema);
    $('query').requestSubmit();
  });
  $('download').addEventListener('click', () => {
    const payload = {...assessment(), submitted_at:new Date().toISOString(), profile:readProfile($('query'))};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)+'\n'], {type:'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dog-questionnaire-answers.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  update();
  for (const id of ['example','search','download']) $(id).disabled = false;
} catch (error) {
  $('dog-fields').textContent = error.message;
  $('dog-fields').classList.add('load-error');
}
