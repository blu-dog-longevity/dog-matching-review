# BLU Dog source-term review

[Open the review page](https://blu-dog-longevity.github.io/dog-matching-review/)

[Try the dog questionnaire](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html) — four labeled scales plus symptom checkboxes, with a live preview of the symptoms they produce. [Questionnaire rules and integration notes](QUESTIONNAIRE.md).

Choose **Inputs** or **Outputs**, select a group, then select a term. The right panel shows the exact source phrases grouped under that term. Source cells and original treatment entries are optional.

This is a review prototype. Grouping a treatment mention does not establish that it was used or effective. Mappings remain partial and open to review.

The term viewer is a standalone HTML file with embedded vocabulary and source-phrase data. The questionnaire loads its shared definition and renderer from the adjacent JSON, JavaScript and CSS files. Neither page has analytics, login or a connection to the BLU Dog production application. Owner identity fields and the original workbook are not included.

GitHub Pages serves `index.html` from the root of `main`. Open that file directly for offline review. Its snapshot is generated from the BLU Dog workspace mapping artifacts; source mapping changes should be made there and regenerated before committing an update here.
