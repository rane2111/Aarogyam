import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Bell, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Consultation = {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  channel_name: string;
  created_at: string;
  patient_name?: string;
};

export default function DoctorRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [requests, setRequests] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  // ── Fetch pending requests with patient names ──────────────────────────────
  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setFetching(true);

    const { data: consultations, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("doctor_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error || !consultations?.length) {
      setRequests([]);
      setFetching(false);
      return;
    }

    // Fetch patient profile names
    const patientIds = consultations.map((c) => c.patient_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", patientIds);

    const nameMap: Record<string, string> = Object.fromEntries(
      (profiles || []).map((p) => [p.id, p.full_name])
    );

    setRequests(
      consultations.map((c) => ({
        ...c,
        patient_name: nameMap[c.patient_id] ?? "Unknown Patient",
      }))
    );
    setFetching(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Realtime: new INSERT → notify + refresh ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`doctor-requests-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultations",
          filter: `doctor_id=eq.${user.id}`,
        },
        () => {
          fetchRequests();
          toast({
            title: "🔔 New Consultation Request!",
            description: "A patient is waiting for your response.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRequests, toast]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const approveRequest = async (req: Consultation) => {
    setLoading(req.id);

    const { error } = await supabase
      .from("consultations")
      .update({ status: "approved" })
      .eq("id", req.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(null);
      return;
    }

    toast({
      title: "✅ Approved!",
      description: `Starting call with ${req.patient_name}…`,
    });
    setLoading(null);
    // Navigate doctor to the video call
    navigate(`/call/${req.channel_name}`);
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const rejectRequest = async (id: string) => {
    setLoading(id);

    await supabase
      .from("consultations")
      .update({ status: "rejected" })
      .eq("id", id);

    toast({ title: "Request rejected." });
    setLoading(null);
    fetchRequests();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Consultation Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject patient consultation requests in real-time
          </p>
        </div>

        {requests.length > 0 && (
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-sm px-4 py-1.5 gap-2">
            <Bell className="h-4 w-4" />
            {requests.length} Pending
          </Badge>
        )}
      </div>

      {/* ── Request List ─────────────────────────────────────────── */}
      {fetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold text-foreground">No Pending Requests</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You'll be notified instantly when a patient sends a request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="border-border hover:shadow-md transition-all duration-200 hover:border-primary/30"
            >
              <CardContent className="py-5 flex items-center justify-between gap-4 flex-wrap">
                {/* Patient info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                    {(req.patient_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{req.patient_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => approveRequest(req)}
                    disabled={loading === req.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading === req.id ? "Approving…" : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectRequest(req.id)}
                    disabled={loading === req.id}
                    className="gap-2 px-6"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}