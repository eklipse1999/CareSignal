"""
FastAPI microservice exposing diabetes and heart disease risk prediction.

Run locally:
    uvicorn app:app --reload --port 8001

Endpoints:
    POST /predict/diabetes
    POST /predict/heart
    GET  /health
"""

import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(
    title="Biomedical Risk Prediction Service",
    description="ML microservice for diabetes and heart disease risk prediction",
    version="1.0.0",
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

diabetes_model = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.pkl"))
diabetes_features = joblib.load(os.path.join(MODELS_DIR, "diabetes_features.pkl"))

heart_model = joblib.load(os.path.join(MODELS_DIR, "heart_model.pkl"))
heart_features = joblib.load(os.path.join(MODELS_DIR, "heart_features.pkl"))
symptom_checker_model = joblib.load(os.path.join(MODELS_DIR, "symptom_checker_model.pkl"))
symptom_columns = joblib.load(os.path.join(MODELS_DIR, "symptom_columns.pkl"))
disease_labels = joblib.load(os.path.join(MODELS_DIR, "disease_labels.pkl"))


class DiabetesInput(BaseModel):
    gender: Literal["Female", "Male", "Other"] = Field(..., example="Female")
    age: float = Field(..., ge=0.08, le=80, example=45)
    hypertension: int = Field(..., ge=0, le=1, example=0)
    heart_disease: int = Field(..., ge=0, le=1, example=0)
    smoking_history: Literal["No Info", "current", "ever", "former", "never", "not current"] = Field(..., example="never")
    bmi: float = Field(..., ge=10.01, le=95.69, example=32.5)
    HbA1c_level: float = Field(..., ge=3.5, le=9.0, example=6.5)
    blood_glucose_level: int = Field(..., ge=80, le=300, example=150)


class HeartInput(BaseModel):
    age: float = Field(..., ge=0, le=120, example=50)
    gender: int = Field(..., ge=1, le=2, example=2)
    height: float = Field(..., ge=100, le=220, example=168)
    weight: float = Field(..., ge=30, le=200, example=62)
    ap_hi: float = Field(..., ge=80, le=250, example=120)
    ap_lo: float = Field(..., ge=40, le=200, example=80)
    cholesterol: int = Field(..., ge=1, le=3, example=1)
    gluc: int = Field(..., ge=1, le=3, example=1)
    smoke: int = Field(..., ge=0, le=1, example=0)
    alco: int = Field(..., ge=0, le=1, example=0)
    active: int = Field(..., ge=0, le=1, example=1)


class SymptomCheckInput(BaseModel):
    symptoms: list[str] = Field(..., min_length=1, example=["high_fever", "chills", "headache"])


class PredictionResponse(BaseModel):
    risk_label: str
    risk_probability: float
    condition: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/diabetes", response_model=PredictionResponse)
def predict_diabetes(payload: DiabetesInput):
    try:
        row = pd.DataFrame([{f: getattr(payload, f) for f in diabetes_features}])
        proba = diabetes_model.predict_proba(row)[0][1]
        label = "High Risk" if proba >= 0.5 else "Low Risk"
        return PredictionResponse(
            risk_label=label, risk_probability=round(float(proba), 3), condition="diabetes"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/heart", response_model=PredictionResponse)
def predict_heart(payload: HeartInput):
    try:
        values = {f: getattr(payload, f) for f in HeartInput.model_fields}
        values["bmi"] = values["weight"] / ((values["height"] / 100) ** 2)
        values["pulse_pressure"] = values["ap_hi"] - values["ap_lo"]
        row = pd.DataFrame([{f: values[f] for f in heart_features}])
        proba = heart_model.predict_proba(row)[0][1]
        label = "High Risk" if proba >= 0.5 else "Low Risk"
        return PredictionResponse(
            risk_label=label, risk_probability=round(float(proba), 3), condition="heart_disease"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/symptoms")
def list_symptoms():
    return {"symptoms": symptom_columns}


@app.post("/predict/symptom-check")
def predict_symptoms(payload: SymptomCheckInput):
    reported_symptoms = set(payload.symptoms)
    unknown_symptoms = sorted(reported_symptoms - set(symptom_columns))
    if unknown_symptoms:
        raise HTTPException(
            status_code=400,
            detail={"message": "Unknown symptom names", "symptoms": unknown_symptoms},
        )

    row = pd.DataFrame([{
        symptom: int(symptom in reported_symptoms) for symptom in symptom_columns
    }])
    probabilities = symptom_checker_model.predict_proba(row)[0]
    ranked_indexes = probabilities.argsort()[::-1][:3]
    return {
        "predictions": [
            {
                "disease": disease_labels[index],
                "probability": round(float(probabilities[index]), 4),
            }
            for index in ranked_indexes
        ]
    }
