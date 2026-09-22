"""Train a multi-class symptom-based disease triage model."""

import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


TRAIN_FILE = "Training.csv"
TEST_FILE = "Testing.csv"
TARGET = "prognosis"
MODEL_FILE = "symptom_checker_model.pkl"
SYMPTOM_FILE = "symptom_columns.pkl"
LABEL_FILE = "disease_labels.pkl"


def load_dataset(path):
    frame = pd.read_csv(path)
    frame = frame.drop(columns=[column for column in frame.columns if column.startswith("Unnamed:")])
    if TARGET not in frame.columns:
        raise ValueError(f"Expected target column '{TARGET}' in {path}")
    return frame


def main():
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")
    train_frame = load_dataset(os.path.join(data_dir, TRAIN_FILE))
    test_frame = load_dataset(os.path.join(data_dir, TEST_FILE))

    symptom_columns = [column for column in train_frame.columns if column != TARGET]
    if symptom_columns != [column for column in test_frame.columns if column != TARGET]:
        raise ValueError("Training and testing symptom columns are not in the same order")

    X_train = train_frame[symptom_columns]
    y_train = train_frame[TARGET].astype(str).str.strip()
    X_test = test_frame[symptom_columns]
    y_test = test_frame[TARGET].astype(str).str.strip()
    disease_labels = sorted(y_train.unique().tolist())

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    print("=== Symptom Disease Checker ===")
    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")
    print(f"Symptoms: {len(symptom_columns)}")
    print(f"Diseases: {len(disease_labels)}")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(classification_report(y_test, predictions, labels=disease_labels, zero_division=0))
    print("Confusion matrix shape:", confusion_matrix(y_test, predictions, labels=disease_labels).shape)
    print("Confusion matrix:")
    print(confusion_matrix(y_test, predictions, labels=disease_labels))

    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(model, os.path.join(models_dir, MODEL_FILE))
    joblib.dump(symptom_columns, os.path.join(models_dir, SYMPTOM_FILE))
    joblib.dump(disease_labels, os.path.join(models_dir, LABEL_FILE))
    print(f"Saved model and metadata to {models_dir}")


if __name__ == "__main__":
    main()