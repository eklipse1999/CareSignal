"""Train an XGBoost cardiovascular disease model on cardio_train.csv."""

import os

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.model_selection import GridSearchCV, train_test_split
from xgboost import XGBClassifier


DATA_FILE = "cardio_train.csv"
TARGET = "cardio"
FEATURES = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo", "cholesterol",
    "gluc", "smoke", "alco", "active", "bmi", "pulse_pressure",
]
PARAM_GRID = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 5, 6],
    "learning_rate": [0.05, 0.1],
}


def clean_and_engineer_features(df):
    initial_rows = len(df)
    valid = (
        df["ap_hi"].between(80, 250)
        & df["ap_lo"].between(40, 200)
        & (df["ap_hi"] > df["ap_lo"])
        & df["height"].between(100, 220)
        & df["weight"].between(30, 200)
    )
    df = df.loc[valid].copy()
    df["age"] = df["age"] / 365.0
    df["bmi"] = df["weight"] / ((df["height"] / 100) ** 2)
    df["pulse_pressure"] = df["ap_hi"] - df["ap_lo"]
    print(f"Removed {initial_rows - len(df)} rows out of {initial_rows} during cleaning")
    return df


def main():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "data", DATA_FILE)
    raw_features = [
        "id", "age", "gender", "height", "weight", "ap_hi", "ap_lo",
        "cholesterol", "gluc", "smoke", "alco", "active", TARGET,
    ]
    df = pd.read_csv(data_path, sep=";", usecols=raw_features)
    initial_rows = len(df)
    df = clean_and_engineer_features(df)

    X = df[FEATURES]
    y = df[TARGET].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    searches = {}
    metrics = {}
    for scoring in ("f1", "roc_auc"):
        search = GridSearchCV(
            XGBClassifier(
                objective="binary:logistic",
                eval_metric="logloss",
                tree_method="hist",
                random_state=42,
                n_jobs=-1,
            ),
            param_grid=PARAM_GRID,
            scoring=scoring,
            cv=3,
            n_jobs=1,
            verbose=1,
        )
        search.fit(X_train, y_train)
        predictions = search.best_estimator_.predict(X_test)
        metrics[scoring] = {
            "accuracy": accuracy_score(y_test, predictions),
            "precision": precision_score(y_test, predictions),
            "recall": recall_score(y_test, predictions),
            "f1": f1_score(y_test, predictions),
        }
        searches[scoring] = search

    selected_scoring = max(metrics, key=lambda scoring: metrics[scoring]["f1"])
    search = searches[selected_scoring]
    predictions = search.best_estimator_.predict(X_test)
    print("=== Cardiovascular Disease Model ===")
    print(f"Removed rows: {initial_rows - len(df)}")
    print("=== Scoring comparison ===")
    for scoring, result in metrics.items():
        print(
            f"{scoring}: accuracy={result['accuracy']:.4f}, "
            f"precision={result['precision']:.4f}, recall={result['recall']:.4f}, "
            f"F1={result['f1']:.4f}"
        )
    print(f"Selected scoring: {selected_scoring}")
    print(f"Best parameters: {search.best_params_}")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(f"Precision: {precision_score(y_test, predictions):.4f}")
    print(f"Recall: {recall_score(y_test, predictions):.4f}")
    print(f"F1: {f1_score(y_test, predictions):.4f}")
    print(classification_report(y_test, predictions, target_names=["No Disease", "Disease"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(search.best_estimator_, os.path.join(models_dir, "heart_model.pkl"))
    joblib.dump(FEATURES, os.path.join(models_dir, "heart_features.pkl"))
    print(f"Saved model to {models_dir}/heart_model.pkl")


if __name__ == "__main__":
    main()
