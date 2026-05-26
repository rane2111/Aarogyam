import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Clock, CheckCircle, XCircle, User, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DoctorProfile = {
  id: string;
  user_id: string;
  full_name: string;
};

type Consultation = {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  channel_name: string;
  created_at: string;
};

export default function BookConsultation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState<string | null>(null);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

  // ── Fetch available doctors ────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      setFetchingDoctors(true);

      // Step 1: get all user_ids that have role = 'doctor'
      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");

      console.log("🔵 user_roles query:", { roleData, roleErr });

      if (roleErr || !roleData?.length) {
        console.warn("No doctor roles found or error:", roleErr);
        setDoctors([]);
        setFetchingDoctors(false);
        return;
      }

      const doctorUserIds = roleData.map((r) => r.user_id);
      console.log("🔵 Doctor user_ids:", doctorUserIds);

      // Fetch profiles by mapping to their primary key 'id'
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .in("id", doctorUserIds);

      console.log("🔵 profiles query:", { profiles, profileErr });

      // In case they don't have user_id on the frontend type, ensure we map the 'id' to 'user_id' for components
      const mappedProfiles = (profiles || []).map((p) => ({
        ...p,
        user_id: p.id // use 'id' as the user_id identifier since it maps to auth.users.id
      }));

      setDoctors(mappedProfiles);
      setFetchingDoctors(false);
    };

    fetchDoctors();
  }, []);

  // ── Fetch my consultations ─────────────────────────────────────────────────
  const fetchMyConsultations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    setConsultations(data || []);
  }, [user]);

  useEffect(() => {
    fetchMyConsultations();
  }, [fetchMyConsultations]);

  // ── Realtime: listen for status changes on MY consultations ────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`patient-consultations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Consultation;
          fetchMyConsultations();

          if (updated.status === "approved") {
            toast({
              title: "✅ Doctor Approved Your Request!",
              description: "Starting video consultation…",
            });
            setTimeout(() => navigate(`/call/${updated.channel_name}`), 1500);
          }
          if (updated.status === "rejected") {
            toast({
              title: "❌ Request Rejected",
              description: "The doctor rejected your request. Please try another.",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, fetchMyConsultations]);

  // ── Send consultation request ──────────────────────────────────────────────
  const requestConsultation = async (doctorUserId: string, doctorName: string) => {
    if (!user) return;
    setLoadingDoctor(doctorUserId);

    const channelName = "room_" + Date.now();

    const { error } = await supabase.from("consultations").insert([
      {
        patient_id: user.id,
        doctor_id: doctorUserId,
        status: "pending",
        channel_name: channelName,
      },
    ]);

    if (error) {
      toast({ title: "Failed to send request", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "✅ Request Sent!",
        description: `Waiting for Dr. ${doctorName} to approve…`,
      });
      fetchMyConsultations();
    }

    setLoadingDoctor(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const hasPendingWith = (doctorUserId: string) =>
    consultations.some((c) => c.doctor_id === doctorUserId && c.status === "pending");

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          Book Consultation
        </h1>
        <p className="text-muted-foreground mt-1">
          Select a doctor and send a consultation request
        </p>
      </div>

      {/* ── Step 1: Select a Doctor ───────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          🔹 Step 1 — Available Doctors
        </h2>

        {fetchingDoctors ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No doctors available right now</p>
              <p className="text-sm mt-1">Please check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => {
              const pending = hasPendingWith(doc.user_id);
              return (
                <Card
                  key={doc.id}
                  className="hover:shadow-lg transition-all duration-200 border-border hover:border-primary/40"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base leading-tight">
                          Dr. {doc.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          General Physician
                        </p>
                        {pending && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-1">
                            <Clock className="h-3 w-3" /> Request pending…
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      className="w-full"
                      disabled={loadingDoctor === doc.user_id || pending}
                      onClick={() => requestConsultation(doc.user_id, doc.full_name)}
                    >
                      {loadingDoctor === doc.user_id
                        ? "Sending…"
                        : pending
                        ? "⏳ Request Pending"
                        : "Request Consultation"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Step 2 / My Requests ─────────────────────────────────── */}
      {consultations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            🔹 Step 2 — My Consultation Requests
          </h2>
          <div className="space-y-3">
            {consultations.map((c) => {
              const doc = doctors.find((d) => d.user_id === c.doctor_id);
              return (
                <Card key={c.id} className="border-border">
                  <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">
                        Dr. {doc?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(c.status)}
                      {c.status === "approved" && (
                        <Button
                          size="sm"
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => navigate(`/call/${c.channel_name}`)}
                        >
                          <Video className="h-4 w-4" />
                          Join Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}