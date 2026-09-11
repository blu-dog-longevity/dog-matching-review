# Starting-condition inputs — prototype

Can we compare dogs by their starting condition without mixing in treatment reactions or later changes? This iteration makes that boundary explicit in the input mappings and the two existing prototype tabs.

Start with any known dog detail, diagnosis or starting symptom. A diagnosis is optional. Choosing Cancer opens mapped types; choosing a type opens its available subtypes. Only the most specific selected diagnosis is scored. Leaving a narrower choice blank keeps the broader match; changing a parent clears its old descendants.

## What belongs where

| Input | Source fields | Relationship and current behavior |
|---|---|---|
| Dog details | P: Sex; Q: Breed; M: Weight; K: Age at diagnosis | Independent descriptors. Age at reporting and age at diagnosis remain distinct. |
| Diagnosis | S: Cancer Type; T: Cancer Subtype | Read together. More specific source diagnosis labels can narrow a broader group. Unknown in S does not erase a diagnosis in T. |
| Diagnosis details | R: Cancer Location; J: Diagnosis Date; U: Stage at Diagnosis | Attributes, not a single subtype chain. Dedicated site/date/stage matching controls remain outside this slice. Location-only labels already mapped as source diagnoses remain visibly unspecified by type. |
| Starting symptoms | Reviewed X: Symptoms of Cancer; selected N: Comorbidities and W: Cancer Measures spans | Share symptom names while retaining each occurrence's source and context. Symptoms remain available without a cancer diagnosis. |
| Veterinary findings | Mixed into N, W and X | Separate from symptom choices. Rising liver values are retained in Source breakdown and excluded from symptom matching. Other findings remain incompletely mapped. |
| Treatment reactions and later changes | Y, Z, AA; later events in AM/AN or misplaced in X | Excluded from initial matching. Reserved for future follow-ups linked to treatment and time. |

## Examples that change matching

- X531 supplies seizures even though the case has no mapped diagnosis. The frequency while taking Keppra is not treated as an untreated baseline frequency.
- N136 supplies “Stiff knees” and “Poor vision”; W546 supplies inability to walk and pain. These existing signs can contribute even though they are outside the symptom column.
- X588 reports urinary signs after four months of integrative treatment. X641 reports swelling and abnormal breathing after tumor removal. Both remain outside the initial symptom match; chronology alone does not establish the cause.
- X621 explicitly says there were no symptoms initially. Its later increase in urination is excluded.
- X478 retains starting appetite loss and diarrhea, while the incontinence described only as occurring “at some point” stays unresolved.
- X558 retains foot chewing as a symptom and separates the liver laboratory trend as a finding.

The private audit reviewed context and input kind in all 492 populated N/W/X cells: 321 in X, 16 in N and 155 in W. It adds 19 reviewed symptom mentions and withholds 13 existing X mentions from initial matching: 11 later/post-treatment observations, one uncertain occurrence and one laboratory finding. The resulting ledger has 479 starting-symptom mentions. Exact source spans and excluded facts are retained.

The form has 30 supported questions: 20 existing BLU Dog questions and 10 proposed additions. Reduced vision replaces the laboratory-trend checkbox. Four existing questions still lack reviewed starting evidence; two treatment-specific questions are explicitly reserved for follow-up. Stool inputs remain deferred to the poop app.

## What this does not establish

The review does not extract every statement in the workbook or verify every symptom's exact pretreatment date. Short symptom lists often supply presenting context with no date; that is the documented working basis. Explicit later events, treatment associations and ambiguous reviewed occurrences are held out. Narrative fields have not been exhaustively mined for starting symptoms.

The diagnosis tree uses existing curated links and explicit disease-family wording. Unclassified or potentially benign source labels remain independently selectable outside the Cancer parent. It is a partial source-label ontology, not a clinically adjudicated taxonomy. Combined symptom questions are display mappings, not biological subtype claims.

Outputs remain reported therapies from comparable cases. A treatment sharing a record with a symptom does not establish that it was given for that symptom, helped it or caused it. Therapy-use data, output categories and their overall support counts are unchanged by this input revision.

[Term definitions](CONTEXT.md) · [Question alignment](INPUT-ALIGNMENT.md)
