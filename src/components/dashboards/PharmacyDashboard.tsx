import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PharmacyDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: medicines = [] } = useQuery({
    queryKey: ["pharmacy-medicines", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("pharmacy_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = medicines.length;
  const inStock = medicines.filter((m) => m.quantity > 0).length;
  const lowStock = medicines.filter((m) => m.quantity > 0 && m.quantity < 10).length;

  const stats = [
    { title: "Total Medicines", value: total, icon: Pill, color: "text-primary" },
    { title: "In Stock", value: inStock, icon: Package, color: "text-success" },
    { title: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-warning" },
    { title: "Out of Stock", value: medicines.filter((m) => m.quantity === 0).length, icon: TrendingUp, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "Pharmacy"} 💊</h1>
          <p className="text-muted-foreground">Manage your pharmacy inventory</p>
        </div>
        <Button onClick={() => navigate("/inventory")}>Manage Inventory</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your pharmacy</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => navigate("/inventory")}>Add New Medicine</Button>
          <Button variant="outline" onClick={() => navigate("/medicines")}>View Public Listings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
