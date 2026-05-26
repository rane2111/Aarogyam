import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Stethoscope, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const quickActions = [
    { title: t("checkSymptoms"), desc: t("checkSymptomsDesc"), icon: Activity, path: "/symptom-checker", color: "text-primary" },

    // ✅ FIXED HERE
    { title: t("bookConsultation"), desc: t("bookConsultationDesc"), icon: Stethoscope, path: "/book-consultation", color: "text-info" },

    { title: t("findMedicine"), desc: t("findMedicineDesc"), icon: Search, path: "/medicines", color: "text-success" },
    { title: t("myAppointments"), desc: t("myAppointmentsDesc"), icon: Calendar, path: "/appointments", color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("welcome")}, {profile?.full_name || t("patient")} 🙏
        </h1>
        <p className="text-muted-foreground">{t("howCanWeHelp")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer hover:shadow-lg transition-shadow border-border"
            onClick={() => navigate(action.path)}
          >
            <CardHeader className="pb-2">
              <action.icon className={`h-8 w-8 ${action.color}`} />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription>{action.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t("noRecentActivity")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("upcomingAppointments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t("noUpcomingAppointments")}</p>

            {/* ✅ FIXED HERE */}
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => navigate("/book-consultation")}
            >
              {t("bookNow")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}