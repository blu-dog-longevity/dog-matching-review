# BLU Dog matching review

[Open dog matching](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html) · [Open source breakdown](https://blu-dog-longevity.github.io/dog-matching-review/)

Start with any dog descriptor or symptom. Results update automatically as information is added. A diagnosis is optional; when supplied, it restricts cases to that diagnosis. Each case shows matching reasons and its reported therapies.

The form follows BLU Dog's symptom checkboxes with optional severity ratings: 1–5 means present, 0 means relieved. It includes 20 existing symptom questions and 10 proposed additions from the PRO reports. Six existing questions have no usable mapping yet; diarrhea and loose-stool inputs await the poop app. [Question alignment and gaps](INPUT-ALIGNMENT.md) · [Conversion and scoring rules](QUESTIONNAIRE.md).

Therapy outputs require at least 10 supporting case groups across the full dataset and at least one report among the matching cases. Counts show **matching cases** and **overall reports** separately. A rare input can still help find a case. One matching case does not establish broad support within that specific profile, and reported use does not establish effectiveness.

The Source breakdown tab shows the original Excel phrases and optional cell references for input and output groups. It retains less-supported, declined and uncertain treatment mentions as source evidence; these are distinct from the therapies eligible for matching results.

The browser uses an explicit snapshot of 671 records in 666 provisional case groups. Names, contact information and raw case narratives are omitted. Entered answers stay in the browser unless downloaded. There is no production database connection.

GitHub Pages serves this directory from the root of `main`. Serve the directory over HTTP to run it locally. Generated snapshots and questions come from the BLU Dog workspace's mapping scripts. Browser scoring and conversion are checked against the local Python implementation, including sparse profiles, refining rankings, therapy support, missing information, diagnosis certainty and repeated-record counting.
