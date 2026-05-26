# Disease Predictor — ML Model

Ensemble ML model (Random Forest + Gradient Boosting) for disease prediction from symptoms.

## Setup

```bash
pip install -r requirements.txt
```

## Train the model

```bash
python model/train.py
```

This builds a balanced dataset, trains the ensemble, cross-validates, and saves `model/disease_predictor.pkl`.

## Predict from command line

```bash
# Using underscores
python model/predictor.py stomach_pain vomiting nausea abdominal_pain

# Using spaces (quote each symptom)
python model/predictor.py "stomach pain" "vomiting" "nausea" "abdominal pain"
```

## Use in Python

```python
from model.predictor import DiseasePredictor

p = DiseasePredictor()
results = p.predict(["stomach_pain", "vomiting", "nausea", "abdominal_pain"])

for r in results:
    print(f"#{r['rank']} {r['disease']} — {r['probability']}%")
```

## Run as API

```bash
python app.py
```

Then POST to `http://localhost:5000/predict`:

```json
{
  "symptoms": ["stomach_pain", "vomiting", "nausea", "abdominal_pain"]
}
```

## Model Details

| Property | Value |
|---|---|
| Algorithm | Random Forest (300 trees) + Gradient Boosting (200 trees) |
| Voting | Soft (probability average), RF weight 2x |
| Diseases | 41 |
| Symptoms | 120+ |
| Dataset | Balanced — 150 samples/disease with 4% noise |
| Cross-validation | 5-fold |
| Expected accuracy | ~95% |

## Why this beats the original

- **Balanced dataset** — equal samples per disease, no bias toward rare conditions
- **Ensemble model** — RF + GB together are more robust than either alone
- **Soft voting** — averages probabilities, not just votes
- **Noise augmentation** — small random noise during training improves generalization
- **Symptom specificity** — core vs. peripheral symptoms weighted differently
