# Input alignment for review

Compared with BLU Dog intake and symptom-check-in code at `e7e0cf6f2f4a940652aae14fb434166739181670`. This records code evidence, not a live survey/database check.

Select a symptom, then optionally rate it 1–5. Every selected rating from 1 through 5 means present; 0 means relieved. Ratings are retained, but old reports do not supply comparable severity. Unchecked symptoms stay unknown.

| Question / group | Existing BLU Dog question? | Source case groups | Prototype status |
|---|---|---:|---|
| Pain or discomfort | Yes | 53 | Available |
| Limping or stiffness | Yes | 16 | Available |
| Low energy / lethargy | Yes | 55 | Available |
| Appetite loss | Yes | 65 | Available |
| Weight loss | Yes | 30 | Available |
| Vomiting | Yes | 15 | Available |
| Diarrhea | Yes | 21 | Poop app: not connected |
| Constipation | Yes | 0 | Not covered: no mapped evidence |
| Excessive thirst | Yes | 5 | Available |
| Coughing | Yes | 13 | Available |
| Labored breathing | Yes | 17 | Available |
| Itching or skin irritation | Yes | 8 | Available |
| Ear discomfort | Yes | 0 | Not covered: no mapped evidence |
| Bad breath / mouth pain | Yes | 1 | Available |
| Restlessness at night | Yes | 1 | Available |
| Anxiety | Yes | 7 | Available |
| Confusion / disorientation | Yes | 0 | Not covered: no mapped evidence |
| Incontinence | Yes | 10 | Available |
| Seizures | Yes | 23 | Available |
| Visible lump or swelling | Yes | 20 | Available |
| Nausea after treatment | Yes | 0 | Not covered: no mapped evidence |
| Mouth sores | Yes | 0 | Not covered: no mapped evidence |
| Fatigue after chemo | Yes | 0 | Not covered: no mapped evidence |
| Bleeding or bruising | Yes | 32 | Available |
| Fever or infection episodes | Yes | 7 | Available |
| Swollen lymph nodes | Yes | 30 | Available |
| Difficulty swallowing | Yes | 2 | Available |
| Limited mobility | No — proposed addition | 36 | Available |
| Anal leakage | No — proposed addition | 1 | Available |
| Foot chewing | No — proposed addition | 2 | Available |
| Inflammation | No — proposed addition | 7 | Available |
| Rising liver lab values | No — proposed addition | 0 | Not covered: no mapped evidence |
| Scooting | No — proposed addition | 2 | Available |
| Generally unwell | No — proposed addition | 11 | Available |
| Difficulty urinating | No — proposed addition | 3 | Available |
| Frequent urination | No — proposed addition | 5 | Available |
| Nausea | No — proposed addition | 4 | Available |
| Loose stools | No — proposed addition | 4 | Poop app: not connected |
| Head bobbing | No — proposed addition | 1 | Available |
| Excess energy | No — proposed addition | 1 | Available |
| Appeared intoxicated | No — proposed addition | 1 | Available |
| Urinating while walking | No — proposed addition | 1 | Available |
| Difficulty focusing | No — proposed addition | 1 | Available |
| Head trembling | No — proposed addition | 1 | Available |

The Source breakdown tab shows the original phrases and Excel cells for each mapped group.

Pain and discomfort share the existing Pain or discomfort answer. Limping and stiffness share Limping or stiffness. Urinary and fecal incontinence share Incontinence. These broader answers do not assert each narrower sign.

Limited mobility is not necessarily limping or stiffness. Foot chewing does not establish itching. Anal leakage does not establish fecal incontinence. Nausea recorded with cancer does not establish Nausea after treatment. These remain separate proposed questions.

An input does not need 10 cases. A rare sign can help find a case. The 10-case minimum is applied to displayed therapy outputs across the full dataset.

Matching includes mapped observations from general symptom fields, treatment fields and follow-up narratives. Report context can optionally refine symptom comparison. Unknown timing and source-column attribution remain distinct from confirmed causation.

This is a bounded mapping pass. Unmapped source text remains in the workbook; no mapped evidence means this prototype cannot yet use that question, not that the symptom is absent from every report. Rising liver values are shown as a finding in Source breakdown, not as a symptom checkbox.

Age at diagnosis and sex are additional prototype descriptors. BLU Dog birth date describes current age and must not be copied into age at diagnosis. Non-cancer condition questions are not yet mapped to this cancer-focused collection.
