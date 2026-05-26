-- Fix status to use 'approved' instead of 'accepted'
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_status_check;
ALTER TABLE consultations
  ADD CONSTRAINT consultations_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Patients can insert their own consultations
CREATE POLICY "Patients can insert consultations"
  ON consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Both patient and doctor of a consultation can view it
CREATE POLICY "Participants can view their consultations"
  ON consultations FOR SELECT TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Only the doctor can approve/reject
CREATE POLICY "Doctors can update their consultations"
  ON consultations FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_id);
