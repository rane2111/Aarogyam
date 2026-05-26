CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'tablets',
  category TEXT,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view medicines" ON public.medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pharmacies can insert own medicines" ON public.medicines FOR INSERT TO authenticated WITH CHECK (auth.uid() = pharmacy_id);
CREATE POLICY "Pharmacies can update own medicines" ON public.medicines FOR UPDATE TO authenticated USING (auth.uid() = pharmacy_id);
CREATE POLICY "Pharmacies can delete own medicines" ON public.medicines FOR DELETE TO authenticated USING (auth.uid() = pharmacy_id);

CREATE INDEX idx_medicines_pharmacy ON public.medicines(pharmacy_id);
CREATE INDEX idx_medicines_name ON public.medicines USING gin(to_tsvector('english', name));

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();