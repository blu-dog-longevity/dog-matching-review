# Dog questionnaire

[Open the questionnaire](https://blu-dog-longevity.github.io/dog-matching-review/questionnaire.html)

Owners answer four labeled 1–5 questions and check observed signs. The right panel shows which symptoms those answers contribute. The downloadable example preserves the profile, original answers, translation decisions, version and submission time.

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

`questionnaire.json` is the shared definition of the questions, labels, conversion rules and review options. `questionnaire.js` renders the form and previews conversion. The local prototype also derives symptoms on the server using that same definition before matching.

Keep the original answers, questionnaire version, observation window and submission time when integrating. Store derived symptoms with their question provenance so a later rule change can be reviewed. The downloadable JSON demonstrates the payload; it does not write to the database.

Stool consistency will come from the BLU Dog poop-app data after the database connection and field mapping are defined. For now its status is `not_connected`, its derived symptom list is empty, and diarrhea/loose-stool checkboxes are excluded. Scooting and anal leakage remain direct owner observations; they are not inferred from a stool image.

The public page previews the form and conversion only. The local matcher accepts this shape at `POST /api/match`:

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
