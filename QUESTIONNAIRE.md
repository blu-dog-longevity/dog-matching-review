# Dog questionnaire

[Open the questionnaire](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html)

Owners answer four labeled 1–5 questions and check observed signs. The right panel shows which symptoms those answers contribute. **Find matching cases** shows comparable historical cases, therapies reported for each case, matching reasons and expandable therapy category counts. **Load example dog** fills the form and runs matching immediately. **Download answers** is an optional export of the profile, original answers, translation decisions, version and submission time.

## Draft conversion rules

All questions refer to the past 7 days. There are no preselected scores.

| Question | Answers that add a symptom | Matching symptom |
|---|---|---|
| Energy compared with usual | 1 Much lower, 2 Lower | Low energy / lethargy |
| Anxiety | 2 Mildly anxious through 5 Extremely anxious | Anxiety |
| Appetite compared with usual | 1 Not eating, 2 Eating less | Appetite loss |
| Ease of movement | 1 Unable through 4 Slight difficulty | Limited mobility |
| Observed signs | Checked | The named symptom |

These are prototype choices for review, not validated clinical cutoffs. Ratings keep their question-specific meaning. A high energy rating does not imply anxiety; limited mobility does not imply limping or pain.

An unanswered scale or unchecked sign is **unknown**. An answered scale outside its symptom range is **not flagged**. The current matcher uses positive symptoms only because missing historical symptoms are not evidence of absence. Historical records receive no invented 1–5 score.

The platform’s existing checkbox-plus-severity form has different semantics: a checked symptom with severity 1 is still present. Do not reinterpret that legacy value using this questionnaire’s thresholds.

## Integration boundary

`questionnaire.json` is the shared definition of the questions, labels, conversion rules and review options. `questionnaire.js` renders the form and derives symptoms. `matcher.js` compares those symptoms and profile fields against `matching-cases.json`; `matching-results.js` renders the cases and reported therapies. The local Python prototype also derives symptoms on the server using that same question definition before matching. Browser and Python matching behavior are checked for parity.

The public case snapshot contains 671 eligible historical records in 666 provisional case groups. It exports only normalized matching features, eligible reported therapies, grouping IDs and source-cell references. Names, contact fields and raw source narratives are omitted. The browser downloads that snapshot once and computes matches locally; entered answers are not sent to a server. Source references identify historical evidence, not a live patient record.

Changing an answer clears previous matches until matching is run again. Fewer than three comparable groups withholds the aggregate therapy counts; available individual cases still show their recorded therapies. Missing/unmapped therapy data remains unknown. Reported use does not establish effectiveness.

Keep the original answers, questionnaire version, observation window and submission time when integrating. Store derived symptoms with their question provenance so a later rule change can be reviewed. The downloadable JSON demonstrates the payload; it does not write to the database.

Stool consistency will come from the BLU Dog poop-app data after the database connection and field mapping are defined. For now its status is `not_connected`, its derived symptom list is empty, and diarrhea/loose-stool checkboxes are excluded. Scooting and anal leakage remain direct owner observations; they are not inferred from a stool image.

The public page now runs form → conversion → matching → reported therapies entirely in the browser. A future platform integration can instead call the local prototype's `POST /api/match` shape:

```json
{
  "diagnosis": "cancer.lymphoma",
  "age_diagnosis": 8,
  "sex": "sex.male",
  "questionnaire": {
    "version": "dog-check-in-v1-draft",
    "answers": {
      "scales": {
        "energy": 2,
        "anxiety": 1,
        "appetite": 3,
        "mobility": 5
      },
      "checked": ["sign.enlarged_lymph_nodes"]
    }
  }
}
```

This produces low energy and enlarged lymph nodes for matching. Raw ratings remain available in the response. When a questionnaire is supplied, the server derives its symptoms and ignores any separately supplied symptom list.
