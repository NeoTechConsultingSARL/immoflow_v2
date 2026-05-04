import { useState } from "react";
import { router } from "@inertiajs/react";
import { Car, Plus, Trash2, Edit2, Info } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Parking {
  id: number;
  name: string;
  price: string | null;
  status: "available" | "unavailable";
}

interface ParkingsProps {
  bloc: any;
  tranche: any;
  project: any;
  company: any;
  parkings: Parking[];
}

const Parkings = ({ bloc, tranche, project, company, parkings }: ParkingsProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ quantity: 1, price: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<Parking | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "" });

  const breadcrumbItems = [
    { title: "Companies", url: "/companies" },
    { title: company.name, url: `/projects?company=${company.id}&companyName=${encodeURIComponent(company.name)}` },
    { title: project.name, url: route('projects.tranches.index', project.id) },
    { title: tranche.name, url: route('projects.tranches.blocs.index', { project: project.id, tranche: tranche.id }) },
    { title: bloc.name, url: route('blocs.management', bloc.id) },
    { title: "Parkings", url: "" }
  ];

  const handleCreate = () => {
    if (form.quantity < 1) return;

    router.post(route('blocs.parkings.store', bloc.id), {
      quantity: form.quantity,
      price: form.price ? parseFloat(form.price) : null
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ quantity: 1, price: "" });
        toast({ title: "Parkings created successfully" });
      }
    });
  };

  const handleUpdate = () => {
    if (!editingParking) return;

    router.put(route('blocs.parkings.update', { bloc: bloc.id, parking: editingParking.id }), {
      name: editForm.name,
      price: editForm.price ? parseFloat(editForm.price) : null
    }, {
      onSuccess: () => {
        setEditOpen(false);
        setEditingParking(null);
        toast({ title: "Parking updated successfully" });
      }
    });
  };

  const handleStatusToggle = (parking: Parking) => {
    router.put(route('blocs.parkings.update', { bloc: bloc.id, parking: parking.id }), {
      status: parking.status === 'available' ? 'unavailable' : 'available'
    }, {
      preserveScroll: true
    });
  };

  const handleDelete = (parking: Parking) => {
    if (confirm("Are you sure you want to delete this parking?")) {
      router.delete(route('blocs.parkings.destroy', { bloc: bloc.id, parking: parking.id }), {
        preserveScroll: true
      });
    }
  };

  const openEdit = (parking: Parking) => {
    setEditingParking(parking);
    setEditForm({ name: parking.name, price: parking.price ? parking.price.toString() : "" });
    setEditOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <AppBreadcrumb customItems={breadcrumbItems} />
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              <Plus className="w-4 h-4" /> Add Parking
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8 max-w-[1400px] animate-in fade-in slide-in-from-bottom-1 duration-400">
            <div className="mb-8">
              <h2 className="font-display text-[1.75rem] xl:text-[2rem] font-bold">
                {bloc.name} Parkings
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">Manage and allocate parking spaces for this bloc.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {parkings.map((parking) => (
                <div
                  key={parking.id}
                  className={`group relative border rounded-xl p-6 text-left transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 bg-card ${
                    parking.status === 'available' ? 'border-emerald-500/30' : 'border-muted'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-background/80 flex items-center justify-center shadow-sm">
                      <Car className={`w-6 h-6 ${parking.status === 'available' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <Label className="text-xs text-muted-foreground">Available</Label>
                        <Switch 
                          checked={parking.status === 'available'}
                          onCheckedChange={() => handleStatusToggle(parking)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(parking)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(parking)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-left w-full">
                    <h3 className="font-display text-lg font-bold mb-1">{parking.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {parking.price ? `$${parking.price}` : "No Price"}
                    </p>
                  </div>
                </div>
              ))}

              {parkings.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Parkings Available</h3>
                  <p className="text-sm text-muted-foreground mb-4">Generate parkings for this bloc to get started.</p>
                  <Button onClick={() => setDialogOpen(true)} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Generate Parkings
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Generate Parkings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Number of parkings *</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1"
                value={form.quantity} 
                onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Default Price (Optional)</Label>
              <Input 
                id="price" 
                type="number" 
                min="0"
                step="0.01"
                value={form.price} 
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                placeholder="0.00"
              />
            </div>
            
            <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-md flex items-start gap-2 mt-2">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p>Parkings will be automatically named following the sequence pattern.</p>
                <p className="opacity-80 mt-1">Example: {project.name.charAt(0).toUpperCase()}_T{tranche.id}_B{bloc.id}_1</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Parking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input 
                id="edit-name" 
                type="text" 
                value={editForm.name} 
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price (Optional)</Label>
              <Input 
                id="edit-price" 
                type="number" 
                min="0"
                step="0.01"
                value={editForm.price} 
                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} 
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Parkings;
