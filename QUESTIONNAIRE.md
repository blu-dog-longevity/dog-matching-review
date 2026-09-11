# Dog questionnaire and matching rules

[Open the prototype](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html) · [Question alignment and gaps](INPUT-ALIGNMENT.md)

The form compares the dog's starting condition, using existing BLU Dog symptom names and the checkbox-plus-severity pattern. Twenty existing questions have reviewed starting-symptom evidence. Ten additional questions are labeled as proposed additions. Four existing questions have no reviewed starting mapping; nausea after treatment and fatigue after chemotherapy are reserved for future follow-ups. Laboratory findings are separate from symptom questions. Diarrhea and loose stools await the poop-app connection. [Input structure and review limits](INPUT-STRUCTURE.md).

## Answers

- Checked with no severity: present.
- Checked with severity 1–5: present. The number is retained; even 1 means present.
- Severity 0: relieved, so the symptom does not contribute to matching.
- Unchecked: unknown. It is not treated as evidence of absence.

The prototype follows the intake's 1–5 presence semantics and the daily check-in's 0 = relieved semantics. Historical cases receive no invented severity, so severity differences are not scored. Only reviewed starting-symptom evidence contributes. Exact pretreatment dates are often unavailable; source context does not establish a verified common observation window or cause.

Broader platform answers preserve their scope: pain/discomfort count once under Pain or discomfort; limping/stiffness count once under Limping or stiffness; urinary/fecal incontinence count once under Incontinence. A broad answer does not assert both narrower signs. Limited mobility, foot chewing, anal leakage and nausea without treatment attribution remain separate rather than being forced into incompatible questions.

## Matching

Any descriptor or positive symptom can start matching. Empty profiles ask for information. A supplied diagnosis remains a condition filter; subtype records can match a broader diagnosis where the ontology has that relationship. Suspected diagnoses require the include-suspected toggle for condition-based queries. Without a diagnosis, comparisons can span different reported conditions, which are shown on each case.

The form opens available types beneath Cancer and subtypes beneath the chosen type. The most specific selected value is the single diagnosis filter. Changing a parent clears its descendants; leaving a child blank keeps the broader filter. Initial symptoms remain available at every level, including when the diagnosis is unknown.

Each matching diagnosis adds 4 points. Each distinct symptom group adds 2 points independently. Breed, sex, age at diagnosis and weight add up to 1 point each. Age similarity is `max(0, 1 - abs(query - recorded) / 5)`; weight similarity is `max(0, 1 - abs(query - recorded) / (query * 0.5))`. These are adjustable prototype settings, not validated biological cutoffs.

Cases rank by **supported points / supplied points**. Missing historical information contributes no support and remains labeled unknown. Known differences are shown. There is no 50% coverage gate, 60% agreement gate, or requirement for a second descriptor. The best 20 case groups sharing some support are shown. Adding symptoms can lift cases sharing those symptoms without eliminating previous candidates merely because other symptoms were not recorded. Percentage support can fall as unanswered historical details are requested; it is not confidence or a match probability.

No learned symptom weights, severity comparisons or symptom-combination bonuses are implemented. Age at diagnosis is distinct from current age inferred from birth date. Non-cancer condition questions have not been mapped into this cancer-focused collection.

## Therapy outputs

A displayed therapy or category needs **at least 10 provisional case groups across the entire dataset** with eligible reported use, and at least one eligible report in the selected matching cases. Nine overall reports does not pass; ten does. There is no minimum input-group count and no minimum matched-cohort size beyond one.

The results show matching counts and whole-dataset counts separately. Global support is not support for effectiveness or for use in the same diagnosis. Categories overlap, and a broad category can meet the minimum while its individual therapies do not; the UI explains that case. Specific therapies below the minimum are omitted from case cards and summaries, while their source evidence remains in Source breakdown.

Repeated source records count once per provisional case group. Declined, hypothetical and ambiguous-use reports do not count. Only records independently matching the query contribute therapies to matching counts. Overall counts include eligible reports across the full dataset. Treatment mapping remains partial.

## Integration

`questionnaire.json` owns the version, labels, question coverage and answer meaning. `questionnaire.js` renders and converts answers; `matcher.js` scores the public snapshot; `matching-results.js` displays cases and counts. Answers update results automatically. The local Python endpoint implements the same conversion and matching behavior.

The public snapshot contains 671 eligible source records in 666 provisional groups, with names, contact fields and raw narratives omitted. The public page computes locally. The optional download retains profile, original answers, translation decisions, questionnaire version and submission time.

Example request to the local prototype's `POST /api/match`:

```json
{
  "breed": "breed.labrador_retriever",
  "questionnaire": {
    "version": "dog-check-in-v3-initial-symptoms",
    "answers": {
      "checked": ["sign.pain_or_discomfort", "sign.low_energy"],
      "severities": {
        "sign.pain_or_discomfort": 1,
        "sign.low_energy": 3
      }
    }
  }
}
```

Both symptoms contribute. When a questionnaire is supplied, the server derives symptoms from its versioned answers and ignores a separately supplied symptom list. The observation window is `initial_symptoms`. Earlier v1 and v2 payloads are rejected rather than silently reinterpreted.
