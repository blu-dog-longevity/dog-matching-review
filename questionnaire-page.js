import {renderDogForm, readAnswers, readProfile, deriveSymptoms, renderTranslation, loadExample} from './questionnaire.js';

const $ = id => document.getElementById(id);
try {
  const response = await fetch('./questionnaire.json');
  if (!response.ok) throw new Error('The questions could not be loaded.');
  const schema = await response.json();
  renderDogForm($('dog-fields'), schema);
  const update = () => renderTranslation($('translation'), deriveSymptoms(readAnswers($('query'), schema), schema));
  $('query').addEventListener('input', update);
  $('query').addEventListener('change', update);
  $('example').addEventListener('click', () => loadExample($('query'), schema));
  $('query').addEventListener('submit', event => {
    event.preventDefault();
    const result = deriveSymptoms(readAnswers($('query'), schema), schema);
    const payload = {...result, submitted_at:new Date().toISOString(), profile:readProfile($('query'))};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)+'\n'], {type:'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dog-questionnaire-example.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  update();
  $('example').disabled = false;
  $('download').disabled = false;
} catch (error) {
  $('dog-fields').textContent = error.message;
  $('dog-fields').classList.add('load-error');
}
