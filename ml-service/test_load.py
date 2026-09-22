import os
import sys
import time

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import joblib

models = [
    "diabetes_features.pkl",
    "heart_features.pkl",
    "disease_labels.pkl",
    "symptom_columns.pkl",
    "heart_model.pkl",
    "symptom_checker_model.pkl",
    "diabetes_model.pkl",
]

for name in models:
    path = os.path.join("models", name)
    print(f"Loading {name}...", flush=True)
    t0 = time.time()
    try:
        obj = joblib.load(path)
        print(f"  OK ({round(time.time() - t0, 2)}s)", flush=True)
    except Exception as e:
        print(f"  FAILED: {e}", flush=True)

