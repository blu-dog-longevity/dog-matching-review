# Input alignment for review

Compared with BLU Dog intake and symptom-check-in code at `1e32dbd96458d06dd898545328dfaa983659c7b1`. This records code evidence, not a live survey/database check.

Match the dog’s starting condition. A diagnosis is optional. Use existing symptoms; exclude treatment reactions and later follow-up changes. Exact pretreatment dates are often unstated in the reports.

Select a symptom, then optionally rate it 1–5. Every selected rating from 1 through 5 means present; 0 means relieved. Ratings are retained, but old reports do not supply comparable severity. Unchecked symptoms stay unknown.

| Question / group | Existing BLU Dog question? | Source case groups | Prototype status |
|---|---|---:|---|
| Pain or discomfort | Yes | 50 | Available |
| Limping or stiffness | Yes | 17 | Available |
| Low energy / lethargy | Yes | 50 | Available |
| Appetite loss | Yes | 58 | Available |
| Weight loss | Yes | 30 | Available |
| Vomiting | Yes | 8 | Available |
| Diarrhea | Yes | 17 | Poop app: not connected |
| Constipation | Yes | 0 | Not covered: no reviewed starting evidence |
| Excessive thirst | Yes | 5 | Available |
| Coughing | Yes | 13 | Available |
| Labored breathing | Yes | 16 | Available |
| Itching or skin irritation | Yes | 7 | Available |
| Ear discomfort | Yes | 0 | Not covered: no reviewed starting evidence |
| Bad breath / mouth pain | Yes | 1 | Available |
| Restlessness at night | Yes | 1 | Available |
| Anxiety | Yes | 5 | Available |
| Confusion / disorientation | Yes | 0 | Not covered: no reviewed starting evidence |
| Incontinence | Yes | 7 | Available |
| Seizures | Yes | 21 | Available |
| Visible lump or swelling | Yes | 28 | Available |
| Nausea after treatment | Yes | 0 | Reserved for treatment follow-up |
| Mouth sores | Yes | 0 | Not covered: no reviewed starting evidence |
| Fatigue after chemo | Yes | 0 | Reserved for treatment follow-up |
| Bleeding or bruising | Yes | 31 | Available |
| Fever or infection episodes | Yes | 8 | Available |
| Swollen lymph nodes | Yes | 32 | Available |
| Difficulty swallowing | Yes | 1 | Available |
| Limited mobility | No — proposed addition | 33 | Available |
| Anal leakage | No — proposed addition | 1 | Available |
| Foot chewing | No — proposed addition | 2 | Available |
| Inflammation | No — proposed addition | 7 | Available |
| Rising liver lab values | No — proposed addition | 0 | Veterinary finding; not a symptom input |
| Scooting | No — proposed addition | 2 | Available |
| Generally unwell | No — proposed addition | 11 | Available |
| Difficulty urinating | No — proposed addition | 3 | Available |
| Frequent urination | No — proposed addition | 3 | Available |
| Nausea | No — proposed addition | 3 | Available |
| Loose stools | No — proposed addition | 4 | Poop app: not connected |
| Reduced vision | No — proposed addition | 1 | Available |

The Source breakdown tab shows the original phrases and Excel cells for each mapped group.

Starting-symptom evidence comes from reviewed spans in X and selected N/W cells. Y/Z/AA reactions and later observations are excluded. Source placement alone does not establish cause or exact chronology. The private input-observations ledger records eligibility for each mapped symptom mention.

Choose a diagnosis, then its available type/subtype. The most specific choice is the diagnosis filter; broader levels do not earn extra points. Location, stage and diagnosis date are distinct attributes, not automatic subtype links. Unclassified source diagnosis labels remain separately selectable.

Pain and discomfort share the existing Pain or discomfort answer. Limping and stiffness share Limping or stiffness. Urinary and fecal incontinence share Incontinence. These broader answers do not assert each narrower sign.

Limited mobility is not necessarily limping or stiffness. Foot chewing does not establish itching. Anal leakage does not establish fecal incontinence. Nausea recorded with cancer does not establish Nausea after treatment. These remain separate proposed questions.

An input does not need 10 cases. A rare sign can help find a case. The 10-case minimum is applied to displayed therapy outputs across the full dataset.

This is a bounded mapping pass. Unmapped source text remains in the workbook; no mapped evidence means this prototype cannot yet use that question, not that the symptom is absent from every report.

Age at diagnosis and sex are additional prototype descriptors. BLU Dog birth date describes current age and must not be copied into age at diagnosis. Non-cancer condition questions are not yet mapped to this cancer-focused collection.
