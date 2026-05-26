"""
Disease Predictor - Flask Web API
Run: python app.py
API: POST /predict  {"symptoms": ["stomach_pain", "vomiting"]}
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from model.predictor import DiseasePredictor

app = Flask(__name__)
CORS(app)

predictor = DiseasePredictor()

@app.route('/')
def index():
    return jsonify({
        "name": "Disease Predictor API",
        "model_accuracy": predictor.accuracy,
        "diseases": len(predictor.diseases),
        "symptoms": len(predictor.symptom_cols),
        "endpoints": {
            "POST /predict": "Predict disease from symptoms",
            "GET /symptoms": "List all valid symptoms",
            "GET /diseases": "List all diseases"
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({"error": "Send JSON with 'symptoms' list"}), 400

    symptoms = data['symptoms']
    top_k = data.get('top_k', 5)
    results = predictor.predict(symptoms, top_k=top_k)
    return jsonify({"results": results})

@app.route('/symptoms', methods=['GET'])
def list_symptoms():
    return jsonify({"symptoms": predictor.symptom_cols})

@app.route('/diseases', methods=['GET'])
def list_diseases():
    return jsonify({"diseases": predictor.diseases})

if __name__ == '__main__':
    print(f"\nDisease Predictor API")
    print(f"Model Accuracy: {predictor.accuracy*100:.1f}%")
    print(f"Diseases: {len(predictor.diseases)} | Symptoms: {len(predictor.symptom_cols)}")
    print(f"\nRunning on http://localhost:8000\n")
    app.run(debug=True, port=8000)
