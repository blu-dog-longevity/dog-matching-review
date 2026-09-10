# BLU Dog source-term review

[Open the review page](https://blu-dog-longevity.github.io/dog-matching-review/)

[Find matching dog cases](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html) — answer four labeled scales and symptom checkboxes, then see comparable cases, their reported therapies and a grouped therapy summary. **Load example dog** runs an example immediately. [Questionnaire rules and integration notes](QUESTIONNAIRE.md).

Choose **Inputs** or **Outputs**, select a group, then select a term. The right panel shows the exact source phrases grouped under that term. Source cells and original treatment entries are optional.

This is a review prototype. Grouping a treatment mention does not establish that it was used or effective. Mappings remain partial and open to review.

The term viewer is a standalone HTML file with embedded vocabulary and source-phrase data. The questionnaire and matcher run entirely in the browser using adjacent JSON, JavaScript and CSS files. Matching uses 671 historical records in 666 provisional case groups, with names, contact information and raw narratives omitted. Only normalized matching features, eligible reported therapies and source-cell references are exported. Entered answers stay in the browser unless downloaded; there is no production backend connection.

Matching rules and cutoffs are experimental. Therapies describe reported use, not effectiveness or recommendations. Missing source symptoms remain unknown, mapping is partial, and therapy frequency counts are withheld when fewer than three case groups match. Stool consistency awaits the future BLU Dog poop-app connection.

GitHub Pages serves this directory from the root of `main`. The term viewer can be opened directly for offline review; serve the directory over HTTP to use the matcher locally. Snapshots are generated from the BLU Dog workspace mapping artifacts; source mapping changes should be made there and regenerated before committing an update here. The public matcher is checked against the local Python matcher for case selection, scores, therapy counts, missing evidence, suspected diagnoses, repeated records and episode isolation.
