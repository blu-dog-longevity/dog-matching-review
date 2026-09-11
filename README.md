# BLU Dog matching review

[Open dog matching](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html) · [Open source breakdown](https://blu-dog-longevity.github.io/dog-matching-review/)

Start with any dog descriptor or symptom. Results update automatically as information is added. A diagnosis is optional; when supplied, it restricts cases to that diagnosis. Each case shows matching reasons and its reported therapies.

The form follows BLU Dog's symptom checkboxes with optional severity ratings: 1–5 means present, 0 means relieved. It includes 20 existing symptom questions and 15 proposed additions from the PRO reports. Six existing questions have no usable mapping yet; laboratory findings are separate from symptoms, and diarrhea/loose-stool inputs await the poop app. Mapped symptoms can now come from general, treatment and follow-up reports. An optional reported-context filter refines symptom evidence. [Question alignment and gaps](INPUT-ALIGNMENT.md) · [Conversion and scoring rules](QUESTIONNAIRE.md).

Therapy outputs require at least 10 supporting case groups across the full dataset and at least one report among the matching cases. Counts show **matching cases** and **overall reports** separately. A rare input can still help find a case. One matching case does not establish broad support within that specific profile, and reported use does not establish effectiveness.

The Source breakdown tab retains its Inputs/Outputs picker and original Excel phrases. Inputs now show observations alongside diagnosis and reported context, with separate groups for other conditions/findings and cancer location. Outputs show product-specific composition, route and dose where linked. Three example buttons open unknown-diagnosis seizures, CBD product details and treatment-associated appetite loss. A report picker exposes selected relationships in 14 reviewed records; the rest remain partial and unlinked details are marked. Matching case cards expose the same report details and timelines.

Two newly reviewed CBD oil uses (rows 32 and 38) raise CBD support from 99 to 101 provisional groups. Separate oils within one report count once; all category support totals are unchanged. Source breakdown also retains less-supported, declined and uncertain mentions as evidence. Product details do not inherit category-level support or establish treatment effectiveness.

The browser uses an explicit snapshot of 671 records in 666 provisional case groups. Names, contact information and raw case narratives are omitted. Entered answers stay in the browser unless downloaded. There is no production database connection.

GitHub Pages serves this directory from the root of `main`. Serve the directory over HTTP to run it locally. Generated snapshots and questions come from the BLU Dog workspace's mapping scripts. Browser scoring and conversion are checked against the local Python implementation, including sparse profiles, refining rankings, therapy support, missing information, diagnosis certainty and repeated-record counting.

The previous version is saved at `before-structure-v1-20260910`; see [rollback](ROLLBACK.md). The question for Logan and the team is whether seeing observations, context and product details linked within a report makes the grouping understandable. This remains an experiment; full statement-level mapping and clinical validation are not complete.
