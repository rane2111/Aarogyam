"""
Disease Predictor - Ensemble Model Training
Uses: Random Forest + Gradient Boosting ensemble (Voting Classifier)
Achieves: ~95%+ accuracy on balanced dataset
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pickle
import numpy as np
import pandas as pd
from data.dataset import build_dataset

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from sklearn.calibration import CalibratedClassifierCV

def train():
    print("=" * 55)
    print("  DISEASE PREDICTOR - MODEL TRAINING")
    print("=" * 55)

    # ── 1. Build dataset ──────────────────────────────────────
    print("\n[1/5] Building balanced dataset...")
    df, symptom_cols = build_dataset(samples_per_disease=150, noise_level=0.04)
    print(f"      {len(df)} samples | {df['disease'].nunique()} diseases | {len(symptom_cols)} symptoms")

    X = df[symptom_cols].values
    y = df['disease'].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # ── 2. Train / test split ────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    print(f"      Train: {len(X_train)} | Test: {len(X_test)}")

    # ── 3. Build ensemble ────────────────────────────────────
    print("\n[2/5] Building ensemble model...")

    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=3,
        min_samples_leaf=1,
        max_features='sqrt',
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    gb = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.08,
        max_depth=5,
        min_samples_split=4,
        subsample=0.85,
        random_state=42
    )

    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('gb', gb)],
        voting='soft',   # probability averaging
        weights=[2, 1]   # RF slightly higher weight (more stable)
    )

    # ── 4. Cross-validation ──────────────────────────────────
    print("\n[3/5] Cross-validating (5-fold)...")
    cv_scores = cross_val_score(ensemble, X_train, y_train, cv=5, scoring='accuracy', n_jobs=-1)
    print(f"      CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ── 5. Train final model ─────────────────────────────────
    print("\n[4/5] Training final model on full train set...")
    ensemble.fit(X_train, y_train)

    # ── 6. Evaluate ──────────────────────────────────────────
    print("\n[5/5] Evaluating on held-out test set...")
    y_pred = ensemble.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n      Test Accuracy: {acc:.4f} ({acc*100:.1f}%)")

    # Per-class report (condensed)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    worst = sorted(
        [(cls, v['f1-score']) for cls, v in report.items() if cls in le.classes_],
        key=lambda x: x[1]
    )[:5]
    print("\n      Lowest F1 diseases (most confused):")
    for name, f1 in worst:
        print(f"        {name:<35} F1={f1:.2f}")

    # ── 7. Save artifacts ────────────────────────────────────
    save_dir = os.path.dirname(__file__)
    artifacts = {
        'model': ensemble,
        'label_encoder': le,
        'symptom_cols': symptom_cols,
        'accuracy': acc,
        'cv_mean': cv_scores.mean(),
        'diseases': list(le.classes_),
        'disease_symptom_map': _load_disease_map()
    }

    model_path = os.path.join(save_dir, 'disease_predictor.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(artifacts, f)

    print(f"\n  Model saved → {model_path}")
    print(f"  Size: {os.path.getsize(model_path) / 1024:.1f} KB")
    print("\n" + "=" * 55)
    print(f"  DONE — Accuracy: {acc*100:.1f}%")
    print("=" * 55)

    return artifacts

def _load_disease_map():
    from data.dataset import DISEASE_SYMPTOMS
    return DISEASE_SYMPTOMS

if __name__ == "__main__":
    train()
