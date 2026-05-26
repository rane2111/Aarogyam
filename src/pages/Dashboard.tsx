import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PatientDashboard from "@/components/dashboards/PatientDashboard";
import DoctorDashboard from "@/components/dashboards/DoctorDashboard";
import PharmacyDashboard from "@/components/dashboards/PharmacyDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <DashboardLayout>
      {role === "doctor" && <DoctorDashboard />}
      {role === "pharmacy" && <PharmacyDashboard />}
      {(role === "patient" || !role) && <PatientDashboard />}
    </DashboardLayout>
  );
}
