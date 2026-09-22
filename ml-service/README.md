# Stage 1 - ML Risk Prediction Service

Part of the **Secure AI-Powered Telemedicine & Disease Risk Prediction System** final-year project.

## What's in this stage
- Two tuned XGBoost models: diabetes risk and heart disease risk
- A FastAPI microservice exposing both as REST endpoints
- SMOTE applied only inside the training pipeline
- Evaluation metrics for the held-out test sets (see below)

## Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate      # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

## Retrain the models

```bash
python train_diabetes.py
python train_heart.py
```

Each script uses an 80/20 stratified split and GridSearchCV over `n_estimators`,
`max_depth`, and `learning_rate`. The diabetes model uses full SMOTE and recall
scoring. Heart experiments use F1 scoring and compare SMOTE 0.5 with
`scale_pos_weight`; the selected heart endpoint uses a 0.40 decision threshold.
best fitted pipeline and its raw feature list are saved in `models/`.

## Run the API

```bash
uvicorn app:app --reload --port 8001
```

Then open http://127.0.0.1:8001/docs for interactive Swagger UI (auto-generated —
great for demoing at your defense).

## Endpoints

### GET /symptoms

Returns the complete list of 132 valid symptom names for a frontend checklist.

### POST /predict/symptom-check

Use this general triage endpoint before the specific diabetes or heart-risk
models when the patient's condition is not yet known.

Request:

```json
{
  "symptoms": ["high_fever", "chills", "headache"]
}
```

Response:

```json
{
  "predictions": [
    {"disease": "Malaria", "probability": 0.82},
    {"disease": "Typhoid", "probability": 0.11},
    {"disease": "Dengue", "probability": 0.04}
  ]
}
```

Unknown symptom names return HTTP 400 with the invalid names listed in the
error response.

### POST /predict/diabetes

Required fields: `gender`, `age`, `hypertension`, `heart_disease`,
`smoking_history`, `bmi`, `HbA1c_level`, and `blood_glucose_level`.

```json
{
  "gender": "Female",
  "age": 45,
  "hypertension": 0,
  "heart_disease": 0,
  "smoking_history": "never",
  "bmi": 32.5,
  "HbA1c_level": 6.5,
  "blood_glucose_level": 150
}
```

### POST /predict/heart

Required fields: `age` in years, `gender`, `height`, `weight`, `ap_hi`, `ap_lo`,
`cholesterol`, `gluc`, `smoke`, `alco`, and `active`.

The API computes `bmi` from `weight` and `height`, and `pulse_pressure` as
`ap_hi - ap_lo`; callers do not send those derived fields.

```json
{
  "age": 50,
  "gender": 2,
  "height": 168,
  "weight": 62,
  "ap_hi": 120,
  "ap_lo": 80,
  "cholesterol": 1,
  "gluc": 1,
  "smoke": 0,
  "alco": 0,
  "active": 1
}
```

Both return:
```json
{ "risk_label": "High Risk", "risk_probability": 0.717, "condition": "diabetes" }
```

## Model performance

Metrics below are from the stratified 20% held-out test sets after selecting
hyperparameters with 3-fold GridSearchCV on the training set.

**Diabetes model**
- Accuracy: 94.04%
- Diabetes precision: 61.42%, recall: 80.35%, F1: 69.62%
- Best parameters: `n_estimators=100`, `max_depth=3`, `learning_rate=0.05`
- Confusion matrix: `[[17442, 858], [334, 1366]]`

**Heart disease model**

The replacement cardio dataset is balanced: 35,021 class-0 rows and 34,979
class-1 rows. Cleaning removed 1,366 rows with unrealistic blood pressure,
height, or weight values, leaving 68,634 rows. Age is converted from days to
years, `id` is dropped, and `bmi` plus `pulse_pressure` are engineered. The
model uses XGBoost with a wider 3-fold GridSearchCV and no SMOTE or class
weighting.

- F1 scoring: accuracy 73.67%, precision 75.77%, recall 68.76%, F1 72.10%
- ROC-AUC scoring: accuracy 73.67%, precision 75.90%, recall 68.54%, F1 72.03%
- Selected scoring: F1
- Best parameters: `n_estimators=300`, `max_depth=3`, `learning_rate=0.1`
- Confusion matrix: `[[5442, 1493], [2122, 4670]]`

Cleaning and feature engineering produced only a small improvement over the
previous 73.41% result and did not reach the requested 90% accuracy target.
Precision, recall, and F1 remain reasonably balanced. The result is reported
from the fixed stratified 20% holdout and should be improved through additional
features, data validation, or model experimentation before clinical use.

**Symptom checker model**

- Algorithm: Random Forest with 300 trees
- Training rows: 4,920
- Provided test rows: 42
- Symptoms: 132
- Diseases: 41
- Accuracy: 97.62%

The supplied test file has only 42 rows, generally one example per disease, so
this accuracy is an initial dataset benchmark rather than a clinical
performance estimate. The loader removes the trailing empty `Unnamed: 133`
column in `Training.csv` and uses `prognosis` as the target.

## Datasets
- Diabetes: Kaggle, [Diabetes prediction dataset](https://www.kaggle.com/datasets/iammustafatz/diabetes-prediction-dataset)
- Heart disease: Kaggle, sulianova, [Cardiovascular Disease dataset](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset)
- Symptom triage: Kaggle, [Disease Prediction Using Machine Learning](https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning)

The local files are `data/diabetes_prediction_dataset.csv` and
`data/cardio_train.csv`. The heart CSV is semicolon-separated and contains
70,000 records.
The local symptom files are `data/Training.csv` and `data/Testing.csv`.

## Next: Stage 2
Web backend (Node.js/Express) — role-based auth (patient/clinician/admin),
and core APIs that call this ML service internally.
