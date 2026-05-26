"""
Disease Predictor - Inference Module
Usage:
    from model.predictor import DiseasePredictor
    p = DiseasePredictor()
    results = p.predict(["stomach_pain", "vomiting", "nausea", "abdominal_pain"])
"""

import pickle
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'disease_predictor.pkl')

class DiseasePredictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at {model_path}. Run 'python model/train.py' first."
            )
        with open(model_path, 'rb') as f:
            self._artifacts = pickle.load(f)

        self.model = self._artifacts['model']
        self.le = self._artifacts['label_encoder']
        self.symptom_cols = self._artifacts['symptom_cols']
        self.diseases = self._artifacts['diseases']
        self.disease_symptom_map = self._artifacts.get('disease_symptom_map', {})
        self.accuracy = self._artifacts.get('accuracy', None)

    def _normalize(self, symptom: str) -> str:
        """Normalize symptom string to match dataset column names."""
        return symptom.strip().lower().replace(" ", "_").replace("-", "_")

    def predict(self, symptoms: list, top_k: int = 5) -> list:
        """
        Predict top-k diseases for given symptoms.

        Args:
            symptoms: list of symptom strings (spaces or underscores ok)
            top_k: number of top diseases to return

        Returns:
            list of dicts with keys: rank, disease, probability, matched_symptoms, confidence
        """
        # Normalize input
        normalized = [self._normalize(s) for s in symptoms]

        # Validate symptoms
        valid = [s for s in normalized if s in self.symptom_cols]
        unknown = [s for s in normalized if s not in self.symptom_cols]

        if not valid:
            return [{
                'error': 'No valid symptoms found. Check spelling.',
                'unknown_symptoms': unknown
            }]

        # Build feature vector
        vec = np.zeros((1, len(self.symptom_cols)), dtype=np.float32)
        for s in valid:
            idx = self.symptom_cols.index(s)
            vec[0, idx] = 1.0

        # Get probability predictions
        proba = self.model.predict_proba(vec)[0]

        # Rank by probability
        top_indices = np.argsort(proba)[::-1][:top_k]

        # Confidence calibration based on symptom count
        n = len(valid)
        if n >= 6:
            conf_level = "high"
        elif n >= 3:
            conf_level = "medium"
        else:
            conf_level = "low — select more symptoms for accurate results"

        results = []
        for rank, idx in enumerate(top_indices, 1):
            disease = self.le.inverse_transform([idx])[0]
            prob = float(proba[idx])

            # Find matched symptoms specific to this disease
            disease_syms = self.disease_symptom_map.get(disease, [])
            matched = [s for s in valid if s in disease_syms]

            results.append({
                'rank': rank,
                'disease': disease,
                'probability': round(prob * 100, 1),
                'matched_symptoms': matched,
                'total_disease_symptoms': len(disease_syms),
                'confidence': conf_level
            })

        # Add metadata
        if results:
            results[0]['_meta'] = {
                'valid_symptoms': valid,
                'unknown_symptoms': unknown,
                'model_accuracy': f"{self.accuracy*100:.1f}%" if self.accuracy else "N/A"
            }

        return results


def predict_cli(symptoms: list):
    """Quick CLI helper."""
    p = DiseasePredictor()
    results = p.predict(symptoms)

    print("\n" + "=" * 55)
    print(f"  SYMPTOMS: {', '.join(symptoms)}")
    print("=" * 55)

    if 'error' in results[0]:
        print(f"  Error: {results[0]['error']}")
        return

    meta = results[0].get('_meta', {})
    print(f"  Valid symptoms: {', '.join(meta.get('valid_symptoms', []))}")
    if meta.get('unknown_symptoms'):
        print(f"  Unknown (ignored): {', '.join(meta.get('unknown_symptoms', []))}")
    print(f"  Confidence: {results[0]['confidence']}")
    print()

    for r in results:
        bar = "█" * int(r['probability'] / 3)
        print(f"  #{r['rank']}  {r['disease']:<35} {r['probability']:>5.1f}%  {bar}")
        if r['matched_symptoms']:
            print(f"       Key match: {', '.join(r['matched_symptoms'][:4])}")
        print()

    print("  ⚠  Not a medical diagnosis. Consult a doctor.")
    print("=" * 55)


if __name__ == "__main__":
    import sys
    symptoms = sys.argv[1:] if len(sys.argv) > 1 else [
        "stomach_pain", "vomiting", "nausea", "abdominal_pain"
    ]
    predict_cli(symptoms)
