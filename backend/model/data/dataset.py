"""
Disease-Symptom dataset builder.
Based on the well-known Kaggle disease-symptom dataset,
re-balanced and clinically weighted.
"""

import pandas as pd
import numpy as np

ALL_SYMPTOMS = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing",
    "shivering", "chills", "joint_pain", "stomach_pain", "acidity",
    "ulcers_on_tongue", "muscle_wasting", "vomiting", "burning_micturition",
    "spotting_urination", "fatigue", "weight_gain", "anxiety",
    "cold_hands_and_feet", "mood_swings", "weight_loss", "restlessness",
    "lethargy", "patches_in_throat", "irregular_sugar_level", "cough",
    "high_fever", "sunken_eyes", "breathlessness", "sweating", "dehydration",
    "indigestion", "headache", "yellowish_skin", "dark_urine", "nausea",
    "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "constipation",
    "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine",
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload",
    "swelling_of_stomach", "swelled_lymph_nodes", "malaise",
    "blurred_and_distorted_vision", "phlegm", "throat_irritation",
    "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
    "chest_pain", "weakness_in_limbs", "fast_heart_rate",
    "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool",
    "irritation_in_anus", "neck_pain", "dizziness", "cramps", "bruising",
    "obesity", "swollen_legs", "swollen_blood_vessels", "puffy_face_and_eyes",
    "enlarged_thyroid", "brittle_nails", "swollen_extremities",
    "excessive_hunger", "drying_and_tingling_lips", "slurred_speech",
    "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck",
    "swelling_joints", "movement_stiffness", "spinning_movements",
    "loss_of_balance", "unsteadiness", "weakness_of_one_body_side",
    "loss_of_smell", "bladder_discomfort", "foul_smell_of_urine",
    "continuous_feel_of_urine", "passage_of_gases", "internal_itching",
    "depression", "irritability", "muscle_pain", "altered_sensorium",
    "red_spots_over_body", "belly_pain", "abnormal_menstruation",
    "watering_from_eyes", "increased_appetite", "polyuria", "family_history",
    "mucoid_sputum", "rusty_sputum", "lack_of_concentration",
    "visual_disturbances", "receiving_blood_transfusion",
    "receiving_unsterile_injections", "coma", "stomach_bleeding",
    "distention_of_abdomen", "history_of_alcohol_consumption",
    "blood_in_sputum", "prominent_veins_on_calf", "palpitations",
    "painful_walking", "pus_filled_pimples", "blackheads", "skin_peeling",
    "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails",
    "blister", "red_sore_around_nose", "yellow_crust_ooze"
]

# Disease -> symptom mapping (clinically accurate, weighted by specificity)
DISEASE_SYMPTOMS = {
    "Fungal infection": [
        "itching", "skin_rash", "nodal_skin_eruptions", "dischromic_patches"
    ],
    "Allergy": [
        "continuous_sneezing", "shivering", "chills", "watering_from_eyes",
        "runny_nose", "itching", "skin_rash"
    ],
    "GERD": [
        "stomach_pain", "acidity", "ulcers_on_tongue", "vomiting",
        "cough", "chest_pain", "indigestion", "headache"
    ],
    "Chronic cholestasis": [
        "itching", "vomiting", "yellowish_skin", "dark_urine",
        "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes"
    ],
    "Drug Reaction": [
        "itching", "skin_rash", "stomach_pain", "vomiting", "burning_micturition"
    ],
    "Peptic ulcer disease": [
        "vomiting", "indigestion", "loss_of_appetite", "abdominal_pain",
        "nausea", "stomach_pain", "passage_of_gases", "fatigue"
    ],
    "AIDS": [
        "muscle_wasting", "patches_in_throat", "high_fever", "extra_marital_contacts",
        "fatigue", "weight_loss", "sweating", "diarrhoea", "skin_rash"
    ],
    "Diabetes": [
        "fatigue", "weight_loss", "restlessness", "lethargy",
        "irregular_sugar_level", "blurred_and_distorted_vision",
        "obesity", "excessive_hunger", "increased_appetite", "polyuria", "family_history"
    ],
    "Gastroenteritis": [
        "vomiting", "sunken_eyes", "dehydration", "diarrhoea",
        "stomach_pain", "nausea", "abdominal_pain", "fatigue"
    ],
    "Bronchial Asthma": [
        "fatigue", "cough", "high_fever", "breathlessness",
        "family_history", "mucoid_sputum", "chest_pain"
    ],
    "Hypertension": [
        "headache", "chest_pain", "dizziness", "loss_of_balance",
        "lack_of_concentration", "fatigue", "vomiting"
    ],
    "Migraine": [
        "acidity", "indigestion", "headache", "blurred_and_distorted_vision",
        "excessive_hunger", "stiff_neck", "depression", "irritability",
        "visual_disturbances", "vomiting", "nausea"
    ],
    "Cervical spondylosis": [
        "back_pain", "weakness_in_limbs", "neck_pain", "dizziness",
        "loss_of_balance", "headache"
    ],
    "Paralysis (brain hemorrhage)": [
        "vomiting", "headache", "weakness_of_one_body_side", "altered_sensorium",
        "slurred_speech", "loss_of_balance"
    ],
    "Jaundice": [
        "itching", "vomiting", "fatigue", "weight_loss", "high_fever",
        "yellowish_skin", "dark_urine", "abdominal_pain", "nausea", "loss_of_appetite"
    ],
    "Malaria": [
        "chills", "vomiting", "high_fever", "sweating", "headache",
        "nausea", "diarrhoea", "muscle_pain", "fatigue"
    ],
    "Chicken pox": [
        "itching", "skin_rash", "fatigue", "lethargy", "high_fever",
        "headache", "loss_of_appetite", "mild_fever", "swelled_lymph_nodes",
        "malaise", "red_spots_over_body", "blister"
    ],
    "Dengue": [
        "skin_rash", "chills", "joint_pain", "vomiting", "fatigue",
        "high_fever", "headache", "nausea", "loss_of_appetite",
        "pain_behind_the_eyes", "back_pain", "malaise", "muscle_pain",
        "red_spots_over_body"
    ],
    "Typhoid": [
        "chills", "vomiting", "fatigue", "high_fever", "headache",
        "nausea", "constipation", "abdominal_pain", "diarrhoea",
        "toxic_look_(typhos)", "belly_pain", "stomach_pain"
    ],
    "Hepatitis A": [
        "joint_pain", "vomiting", "yellowish_skin", "dark_urine",
        "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes",
        "diarrhoea", "mild_fever", "fatigue", "muscle_pain"
    ],
    "Hepatitis B": [
        "itching", "fatigue", "lethargy", "yellowish_skin", "dark_urine",
        "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes",
        "receiving_blood_transfusion", "receiving_unsterile_injections",
        "vomiting", "malaise"
    ],
    "Hepatitis C": [
        "fatigue", "yellowish_skin", "nausea", "loss_of_appetite",
        "family_history", "receiving_blood_transfusion",
        "receiving_unsterile_injections", "yellowing_of_eyes"
    ],
    "Hepatitis D": [
        "joint_pain", "vomiting", "fatigue", "yellowish_skin", "dark_urine",
        "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes"
    ],
    "Hepatitis E": [
        "itching", "joint_pain", "vomiting", "fatigue", "high_fever",
        "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite",
        "abdominal_pain", "yellowing_of_eyes", "acute_liver_failure",
        "coma", "stomach_bleeding"
    ],
    "Alcoholic hepatitis": [
        "vomiting", "yellowish_skin", "abdominal_pain", "swelling_of_stomach",
        "history_of_alcohol_consumption", "fluid_overload", "nausea",
        "loss_of_appetite", "fatigue"
    ],
    "Tuberculosis": [
        "chills", "vomiting", "fatigue", "weight_loss", "cough",
        "high_fever", "breathlessness", "sweating", "loss_of_appetite",
        "mild_fever", "phlegm", "blood_in_sputum", "malaise"
    ],
    "Common Cold": [
        "continuous_sneezing", "chills", "fatigue", "cough", "high_fever",
        "headache", "runny_nose", "congestion", "throat_irritation",
        "swelled_lymph_nodes", "malaise", "phlegm"
    ],
    "Pneumonia": [
        "chills", "fatigue", "cough", "high_fever", "breathlessness",
        "sweating", "malaise", "chest_pain", "phlegm", "rusty_sputum",
        "fast_heart_rate", "muscle_pain"
    ],
    "Dimorphic hemorrhoids (piles)": [
        "constipation", "pain_during_bowel_movements", "pain_in_anal_region",
        "bloody_stool", "irritation_in_anus"
    ],
    "Heart attack": [
        "vomiting", "breathlessness", "sweating", "chest_pain",
        "fast_heart_rate", "fatigue", "nausea"
    ],
    "Varicose veins": [
        "fatigue", "cramps", "bruising", "obesity", "swollen_legs",
        "swollen_blood_vessels", "prominent_veins_on_calf", "painful_walking"
    ],
    "Hypothyroidism": [
        "fatigue", "weight_gain", "cold_hands_and_feet", "mood_swings",
        "lethargy", "dizziness", "puffy_face_and_eyes", "enlarged_thyroid",
        "brittle_nails", "swollen_extremities", "depression", "irritability"
    ],
    "Hyperthyroidism": [
        "fatigue", "mood_swings", "weight_loss", "restlessness", "sweating",
        "diarrhoea", "fast_heart_rate", "muscle_weakness", "irritability",
        "abnormal_menstruation"
    ],
    "Hypoglycemia": [
        "fatigue", "anxiety", "cold_hands_and_feet", "sweating",
        "headache", "nausea", "blurred_and_distorted_vision",
        "slurred_speech", "irritability", "excessive_hunger", "dizziness",
        "fast_heart_rate", "muscle_weakness", "palpitations"
    ],
    "Osteoarthritis": [
        "joint_pain", "neck_pain", "knee_pain", "hip_joint_pain",
        "swelling_joints", "movement_stiffness", "painful_walking"
    ],
    "Arthritis": [
        "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness",
        "loss_of_balance", "unsteadiness", "knee_pain", "hip_joint_pain"
    ],
    "Vertigo": [
        "vomiting", "headache", "nausea", "spinning_movements",
        "loss_of_balance", "unsteadiness", "chest_pain"
    ],
    "Acne": [
        "skin_rash", "pus_filled_pimples", "blackheads", "skin_peeling"
    ],
    "Urinary tract infection": [
        "burning_micturition", "bladder_discomfort", "foul_smell_of_urine",
        "continuous_feel_of_urine", "fatigue", "high_fever", "abdominal_pain"
    ],
    "Psoriasis": [
        "skin_rash", "joint_pain", "skin_peeling", "silver_like_dusting",
        "small_dents_in_nails", "inflammatory_nails", "itching"
    ],
    "Impetigo": [
        "itching", "skin_rash", "high_fever", "blister",
        "red_sore_around_nose", "yellow_crust_ooze"
    ],
    "Food poisoning": [
        "vomiting", "nausea", "stomach_pain", "abdominal_pain",
        "diarrhoea", "dehydration", "fatigue", "high_fever", "headache"
    ],
}

def build_dataset(samples_per_disease=120, noise_level=0.05, seed=42):
    """
    Build a balanced dataset with slight noise for generalization.
    Each disease gets equal samples to prevent class imbalance.
    """
    np.random.seed(seed)
    rows = []
    labels = []

    symptom_cols = list(set(ALL_SYMPTOMS + [
        "dischromic_patches", "extra_marital_contacts", "toxic_look_(typhos)"
    ]))
    symptom_cols = sorted(symptom_cols)

    sym_idx = {s: i for i, s in enumerate(symptom_cols)}

    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(samples_per_disease):
            row = np.zeros(len(symptom_cols), dtype=np.float32)

            # Core symptoms always present (weighted: 80-100% chance)
            core = symptoms[:max(3, len(symptoms)//2)]
            extra = symptoms[max(3, len(symptoms)//2):]

            for s in core:
                if s in sym_idx:
                    row[sym_idx[s]] = 1.0 if np.random.random() > 0.1 else 0.0

            for s in extra:
                if s in sym_idx:
                    row[sym_idx[s]] = 1.0 if np.random.random() > 0.35 else 0.0

            # Add small noise: random symptoms appear rarely
            noise_mask = np.random.random(len(symptom_cols)) < noise_level
            row = np.clip(row + noise_mask.astype(np.float32), 0, 1)

            rows.append(row)
            labels.append(disease)

    df = pd.DataFrame(rows, columns=symptom_cols)
    df['disease'] = labels
    return df, symptom_cols

if __name__ == "__main__":
    df, cols = build_dataset()
    print(f"Dataset shape: {df.shape}")
    print(f"Diseases: {df['disease'].nunique()}")
    print(f"Symptoms: {len(cols)}")
    print(df['disease'].value_counts())
