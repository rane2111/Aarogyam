import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, CheckCircle, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // ── Live pending count ─────────────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("status", "pending");
    setPendingCount(count ?? 0);
  }, [user]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Realtime: update badge when new requests arrive or get resolved
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`doctor-dashboard-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations", filter: `doctor_id=eq.${user.id}` }, fetchPending)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchPending]);

  const stats = [
    { title: "Pending Requests", value: String(pendingCount), icon: Clock, color: "text-warning" },
    { title: "Today's Appointments", value: "0", icon: Calendar, color: "text-info" },
    { title: "Total Patients", value: "0", icon: Users, color: "text-primary" },
    { title: "Completed", value: "0", icon: CheckCircle, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dr. {profile?.full_name || "Doctor"} 👨‍⚕️
          </h1>
          <p className="text-muted-foreground">Here's your practice overview</p>
        </div>
        {pendingCount > 0 && (
          <Button
            onClick={() => navigate("/doctor-requests")}
            className="bg-primary gap-2 animate-pulse"
          >
            <Bell className="h-4 w-4" />
            {pendingCount} Pending Request{pendingCount > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="relative">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                {stat.title === "Pending Requests" && pendingCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/40 border-border"
          onClick={() => navigate("/doctor-requests")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Consultation Requests</CardTitle>
              {pendingCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{pendingCount} new</Badge>
              )}
            </div>
            <CardDescription>Approve or reject pending patient requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingCount > 0 ? (
              <p className="text-sm text-primary font-medium">
                🔔 You have {pendingCount} patient{pendingCount > 1 ? "s" : ""} waiting — click to review
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No pending requests right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No appointments scheduled for today.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
