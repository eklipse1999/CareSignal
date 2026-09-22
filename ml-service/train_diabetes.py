import os

import joblib
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier


DATA_FILE = "diabetes_prediction_dataset.csv"
TARGET = "diabetes"
FEATURES = [
    "gender", "age", "hypertension", "heart_disease", "smoking_history",
    "bmi", "HbA1c_level", "blood_glucose_level",
]
CATEGORICAL_FEATURES = ["gender", "smoking_history"]
NUMERIC_FEATURES = [feature for feature in FEATURES if feature not in CATEGORICAL_FEATURES]


def main():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "data", DATA_FILE)
    df = pd.read_csv(data_path, usecols=FEATURES + [TARGET])
    X = df[FEATURES]
    y = df[TARGET].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer([
        ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ("numeric", "passthrough", NUMERIC_FEATURES),
    ])
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("smote", SMOTE(sampling_strategy=1.0, random_state=42)),
        ("classifier", XGBClassifier(
            objective="binary:logistic", eval_metric="logloss", tree_method="hist",
            random_state=42, n_jobs=-1,
        )),
    ])
    search = GridSearchCV(
        pipeline,
        param_grid={
            "classifier__n_estimators": [100, 200],
            "classifier__max_depth": [3, 5],
            "classifier__learning_rate": [0.05, 0.1],
        },
        scoring="recall", cv=3, n_jobs=1, verbose=1,
    )
    search.fit(X_train, y_train)
    predictions = search.best_estimator_.predict(X_test)
    print("=== Diabetes Model ===")
    print(f"Best parameters: {search.best_params_}")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(f"Diabetes precision: {precision_score(y_test, predictions, zero_division=0):.4f}")
    print(f"Diabetes recall: {recall_score(y_test, predictions, zero_division=0):.4f}")
    print(f"Diabetes F1: {f1_score(y_test, predictions, zero_division=0):.4f}")
    print(classification_report(y_test, predictions, target_names=["No Diabetes", "Diabetes"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(search.best_estimator_, os.path.join(models_dir, "diabetes_model.pkl"))
    joblib.dump(FEATURES, os.path.join(models_dir, "diabetes_features.pkl"))
    print(f"\nSaved model to {models_dir}/diabetes_model.pkl")


if __name__ == "__main__":
    main()
