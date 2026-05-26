import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, ShieldCheck } from "lucide-react";

export default function MedicineSearch() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ["all-medicines", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("medicines")
        .select("*")
        .gt("quantity", 0)
        .order("name");

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch pharmacy names for the results
      const pharmacyIds = [...new Set(data.map((m: any) => m.pharmacy_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", pharmacyIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);
      return data.map((m: any) => ({ ...m, pharmacy_name: profileMap.get(m.pharmacy_id) || "Unknown" }));
    },
    enabled: true,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Medicines</h1>
          <p className="text-muted-foreground">Search for medicine availability across pharmacies</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Searching...</p>
        ) : medicines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchTerm ? `No medicines found for "${searchTerm}"` : "Search for a medicine to see availability"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((med: any) => (
              <Card key={med.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{med.name}</CardTitle>
                      {med.generic_name && (
                        <p className="text-xs text-muted-foreground mt-1">{med.generic_name}</p>
                      )}
                    </div>
                    {med.requires_prescription && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <ShieldCheck className="h-3 w-3" /> Rx
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {med.manufacturer && (
                    <p className="text-xs text-muted-foreground">By {med.manufacturer}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₹{med.price}</span>
                    <Badge variant={med.quantity < 10 ? "secondary" : "default"}>
                      {med.quantity} {med.unit} available
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 border-t">
                    Pharmacy: {med.pharmacy_name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
