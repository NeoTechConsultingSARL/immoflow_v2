import { useState } from "react";
import { router } from "@inertiajs/react";
import { Home, Plus, Pencil, Trash2, Ruler, LayoutGrid, Rows3, Table as TableIcon } from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: number;
  bloc_id: number;
  property_type_id: number;
  name: string;
  price: number;
  facade: string;
  surface: number;
  surface_titled: number;
  status: "available" | "sold" | "reserved";
  floor_number: number | null;
  pieces_description: string | null;
  has_basement: boolean;
  has_mezzanine: boolean;
}

interface PropertiesProps {
  bloc: any;
  tranche: any;
  project: any;
  company: any;
  propertyType: any;
  properties: Property[];
}

const statusStyles: Record<string, string> = {
  available: "bg-emerald-500/10 text-emerald-600",
  reserved: "bg-amber-500/10 text-amber-600",
  sold: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, string> = {
  Apartment: "🏢",
  Penthouse: "🌆",
  Studio: "🏠",
  Duplex: "🏘️",
  Villa: "🏡",
  House: "🏡",
  Land: "🌍",
  Store: "🏪",
  Office: "💼",
};

type ViewMode = "card" | "grid" | "table";

const emptyForm = {
  name: "",
  price: "",
  facade: "",
  surface: "",
  surface_titled: "",
  status: "available" as Property["status"],
  floor_number: "",
  pieces_description: "",
  has_basement: false,
  has_mezzanine: false,
};

const Properties = ({ bloc, tranche, project, company, propertyType, properties }: PropertiesProps) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isLivingUnit = ["Apartment", "Duplex", "Duplexe", "House", "Villa", "Office"].includes(propertyType.name);
  const isStore = propertyType.name === "Store";

  const breadcrumbItems = [
    { title: "Companies", url: "/companies" },
    { title: company.name, url: `/projects?company=${company.id}&companyName=${encodeURIComponent(company.name)}` },
    { title: project.name, url: route('projects.tranches.index', project.id) },
    { title: tranche.name, url: route('projects.tranches.blocs.index', { project: project.id, tranche: tranche.id }) },
    { title: bloc.name, url: route('blocs.management', bloc.id) },
    { title: "Property Types", url: route('blocs.property-types', bloc.id) },
    { title: propertyType.name, url: "" }
  ];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      price: p.price ? p.price.toString() : "",
      facade: p.facade || "",
      surface: p.surface ? p.surface.toString() : "",
      surface_titled: p.surface_titled ? p.surface_titled.toString() : "",
      status: p.status,
      floor_number: p.floor_number !== null ? p.floor_number.toString() : "",
      pieces_description: p.pieces_description || "",
      has_basement: !!p.has_basement,
      has_mezzanine: !!p.has_mezzanine,
    });
    setDialogOpen(true);
  };

  const openDelete = (p: Property) => {
    setDeleting(p);
    setDeleteOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.surface || !form.facade || !form.surface_titled) {
      toast({ title: "Please fill all common required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      facade: form.facade,
      surface: parseFloat(form.surface),
      surface_titled: parseFloat(form.surface_titled),
      status: form.status,
      ...(isLivingUnit && {
        floor_number: form.floor_number ? parseInt(form.floor_number) : null,
        pieces_description: form.pieces_description,
        has_basement: form.has_basement,
      }),
      ...(isStore && {
        has_mezzanine: form.has_mezzanine,
      }),
    };

    if (editing) {
      router.put(route('blocs.properties.update', { bloc: bloc.id, type: propertyType.id, property: editing.id }), payload, {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Property updated successfully" });
        }
      });
    } else {
      router.post(route('blocs.properties.store', { bloc: bloc.id, type: propertyType.id }), payload, {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Property created successfully" });
        }
      });
    }
  };

  const handleDelete = () => {
    if (deleting) {
      router.delete(route('blocs.properties.destroy', { bloc: bloc.id, type: propertyType.id, property: deleting.id }), {
        onSuccess: () => {
          setDeleteOpen(false);
          setDeleting(null);
          toast({ title: "Property deleted successfully" });
        }
      });
    }
  };

  const updateField = (field: keyof typeof form, value: string | number | boolean) => setForm(prev => ({ ...prev, [field]: value }));

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
            <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8 max-w-[1400px] animate-in fade-in slide-in-from-bottom-1 duration-400">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-[1.75rem] xl:text-[2rem] font-bold">
                  {propertyType.name} Units
                </h2>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Manage {propertyType.name.toLowerCase()} properties in {bloc.name}.
                </p>
              </div>
              <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)} className="bg-muted rounded-lg p-0.5">
                <ToggleGroupItem value="card" aria-label="Card view" className="px-2.5 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
                  <Rows3 className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view" className="px-2.5 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table view" className="px-2.5 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
                  <TableIcon className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Card View - single column */}
            {viewMode === "card" && (
              <div className="flex flex-col gap-3">
                {properties.map((property) => (
                  <div key={property.id} className="bg-card border border-border rounded-xl shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 flex items-center gap-4 p-4">
                    <span className="text-2xl shrink-0">{typeIcons[propertyType.name] || "🏢"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-bold leading-tight truncate">{property.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{propertyType.name} · {property.facade} Facade</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{property.surface} m²</span>
                    </div>
                    <span className="text-sm font-semibold shrink-0">${property.price}</span>
                    <span className={cn("text-[0.625rem] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase", statusStyles[property.status])}>
                      {property.status}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(property)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => openDelete(property)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View - multi-column cards */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {properties.map((property) => (
                  <div key={property.id} className="bg-card border border-border rounded-xl shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 flex flex-col">
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{typeIcons[propertyType.name] || "🏢"}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => openEdit(property)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => openDelete(property)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-display text-base font-bold leading-tight">{property.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">{propertyType.name} · {property.facade} Facade</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-sm font-semibold">${property.price}</span>
                      <span className={cn("text-[0.625rem] font-semibold px-2 py-0.5 rounded-full uppercase", statusStyles[property.status])}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Facade</TableHead>
                      <TableHead>Area (m²)</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-semibold">{property.name}</TableCell>
                        <TableCell><span className="mr-1.5">{typeIcons[propertyType.name] || "🏢"}</span>{propertyType.name}</TableCell>
                        <TableCell>{property.facade}</TableCell>
                        <TableCell>{property.surface}</TableCell>
                        <TableCell className="font-semibold">${property.price}</TableCell>
                        <TableCell>
                          <span className={cn("text-[0.625rem] font-semibold px-2 py-0.5 rounded-full uppercase", statusStyles[property.status])}>
                            {property.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(property)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => openDelete(property)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {properties.length === 0 && (
              <div className="text-center py-20">
                <Home className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-display text-lg font-bold mb-1">No properties found</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a {propertyType.name.toLowerCase()} to get started.</p>
                <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                  <Plus className="w-4 h-4" /> Add {propertyType.name}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? "Edit Property" : "New Property"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="font-semibold text-lg border-b pb-2">Common Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Unit A1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={e => updateField("price", e.target.value)} placeholder="0.00" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="facade">Facade *</Label>
                <Input id="facade" value={form.facade} onChange={e => updateField("facade", e.target.value)} placeholder="North" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surface">Surface *</Label>
                <Input id="surface" type="number" min="0" step="0.01" value={form.surface} onChange={e => updateField("surface", e.target.value)} placeholder="m²" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surface_titled">Surface Titled *</Label>
                <Input id="surface_titled" type="number" min="0" step="0.01" value={form.surface_titled} onChange={e => updateField("surface_titled", e.target.value)} placeholder="m²" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={v => updateField("status", v as Property["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLivingUnit && (
              <>
                <h3 className="font-semibold text-lg border-b pb-2 mt-4">Living Unit Details</h3>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="grid gap-2">
                    <Label htmlFor="floor_number">Floor Number *</Label>
                    <Input id="floor_number" type="number" value={form.floor_number} onChange={e => updateField("floor_number", e.target.value)} placeholder="1" />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox id="has_basement" checked={form.has_basement} onCheckedChange={(c) => updateField("has_basement", !!c)} />
                    <Label htmlFor="has_basement">Has Basement</Label>
                  </div>
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="pieces_description">Pieces Description *</Label>
                  <Textarea id="pieces_description" value={form.pieces_description} onChange={e => updateField("pieces_description", e.target.value)} placeholder="e.g. 2 Bedrooms, 1 Living Room, 1 Kitchen" />
                </div>
              </>
            )}

            {isStore && (
              <>
                <h3 className="font-semibold text-lg border-b pb-2 mt-4">Store Details</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="has_mezzanine" checked={form.has_mezzanine} onCheckedChange={(c) => updateField("has_mezzanine", !!c)} />
                  <Label htmlFor="has_mezzanine">Has Mezzanine</Label>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              {editing ? "Save Changes" : "Create Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All data associated with this property will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Properties;
