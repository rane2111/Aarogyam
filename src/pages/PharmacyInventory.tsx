import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";

type Medicine = {
  id: string;
  name: string;
  generic_name: string | null;
  manufacturer: string | null;
  price: number;
  quantity: number;
  unit: string;
  category: string | null;
  requires_prescription: boolean;
  description: string | null;
};

const emptyForm = {
  name: "",
  generic_name: "",
  manufacturer: "",
  price: 0,
  quantity: 0,
  unit: "tablets",
  category: "",
  requires_prescription: false,
  description: "",
};

export default function PharmacyInventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ["pharmacy-medicines", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("pharmacy_id", user!.id)
        .order("name");
      if (error) throw error;
      return data as Medicine[];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: typeof emptyForm) => {
      const payload = {
        ...formData,
        generic_name: formData.generic_name || null,
        manufacturer: formData.manufacturer || null,
        category: formData.category || null,
        description: formData.description || null,
        pharmacy_id: user!.id,
      };

      if (editingId) {
        const { error } = await supabase.from("medicines").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("medicines").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-medicines"] });
      toast({ title: editingId ? "Medicine updated" : "Medicine added" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-medicines"] });
      toast({ title: "Medicine removed" });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const openEdit = (med: Medicine) => {
    setForm({
      name: med.name,
      generic_name: med.generic_name || "",
      manufacturer: med.manufacturer || "",
      price: med.price,
      quantity: med.quantity,
      unit: med.unit,
      category: med.category || "",
      requires_prescription: med.requires_prescription,
      description: med.description || "",
    });
    setEditingId(med.id);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const lowStock = medicines.filter((m) => m.quantity < 10);
  const inStock = medicines.filter((m) => m.quantity > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pharmacy Inventory</h1>
            <p className="text-muted-foreground">Manage your medicine stock</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Medicine</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Generic Name</Label>
                    <Input value={form.generic_name} onChange={(e) => setForm({ ...form, generic_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Antibiotics, Pain Relief" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="tablets, ml, etc." />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.requires_prescription} onCheckedChange={(v) => setForm({ ...form, requires_prescription: v })} />
                  <Label>Requires Prescription</Label>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : editingId ? "Update" : "Add Medicine"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{medicines.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
              <Package className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{inStock.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lowStock.length}</div></CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine List</CardTitle>
            <CardDescription>{medicines.length} medicines in your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : medicines.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medicines yet. Click "Add Medicine" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Rx</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{med.name}</p>
                            {med.generic_name && <p className="text-xs text-muted-foreground">{med.generic_name}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{med.category || "—"}</TableCell>
                        <TableCell>₹{med.price}</TableCell>
                        <TableCell>
                          <Badge variant={med.quantity === 0 ? "destructive" : med.quantity < 10 ? "secondary" : "default"}>
                            {med.quantity} {med.unit}
                          </Badge>
                        </TableCell>
                        <TableCell>{med.requires_prescription ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(med)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(med.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
