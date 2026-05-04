import { useState } from "react";
import { Plus, Pencil, Trash2, Building2, Home, Landmark, Store, Briefcase, LayoutGrid, Warehouse, Hotel, Factory, TreePine, Castle, Tent, School, Church, Hospital, LucideIcon } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const iconOptions: { name: string; icon: LucideIcon }[] = [
  { name: "Building", icon: Building2 },
  { name: "Home", icon: Home },
  { name: "Landmark", icon: Landmark },
  { name: "Store", icon: Store },
  { name: "Briefcase", icon: Briefcase },
  { name: "Layout", icon: LayoutGrid },
  { name: "Warehouse", icon: Warehouse },
  { name: "Hotel", icon: Hotel },
  { name: "Factory", icon: Factory },
  { name: "Tree", icon: TreePine },
  { name: "Castle", icon: Castle },
  { name: "Tent", icon: Tent },
  { name: "School", icon: School },
  { name: "Church", icon: Church },
  { name: "Hospital", icon: Hospital },
];

export interface PropertyType {
  id: number;
  name: string;
  icon: string;
  description: string | null;
}

const SettingsPropertyTypes = ({ propertyTypes = [] }: { propertyTypes: PropertyType[] }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PropertyType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<PropertyType | null>(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: "",
    description: "",
    icon: "Building"
  });

  const openCreate = () => {
    setEditing(null);
    reset();
    clearErrors();
    setDialogOpen(true);
  };

  const openEdit = (type: PropertyType) => {
    setEditing(type);
    setData({
      name: type.name,
      description: type.description || "",
      icon: type.icon || "Building"
    });
    clearErrors();
    setDialogOpen(true);
  };

  const openDelete = (type: PropertyType) => {
    setDeleting(type);
    setDeleteOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      put(route('settings.property-types.update', editing.id), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Property type updated successfully." });
        },
      });
    } else {
      post(route('settings.property-types.store'), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Property type created successfully." });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleting) {
      destroy(route('settings.property-types.destroy', deleting.id), {
        onSuccess: () => {
          setDeleteOpen(false);
          setDeleting(null);
          toast({ title: "Property type deleted successfully." });
        },
      });
    }
  };

  const selectedIcon = iconOptions.find(i => i.name === data.icon)?.icon;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <AppBreadcrumb />
            </div>
            <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              <Plus className="w-4 h-4" /> New Property Type
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8 max-w-[1100px] animate-in fade-in slide-in-from-bottom-1 duration-400">
            <div className="mb-8">
              <h2 className="font-display text-[1.75rem] xl:text-[2rem] font-bold">Manage Property Types</h2>
              <p className="text-[0.9375rem] text-muted-foreground">Add, edit or remove property types available across all projects.</p>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyTypes.map((type) => {
                    const IconOption = iconOptions.find(i => i.name === type.icon);
                    const Icon = IconOption ? IconOption.icon : Building2;
                    return (
                      <TableRow key={type.id}>
                        <TableCell>
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{type.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(type)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => openDelete(type)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {propertyTypes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No property types yet. Click "New Property Type" to add one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? "Edit Property Type" : "New Property Type"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="st-name">Name *</Label>
              <Input id="st-name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Townhouse" />
              {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-desc">Description</Label>
              <Textarea id="st-desc" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Brief description" rows={3} />
              {errors.description && <div className="text-sm text-destructive">{errors.description}</div>}
            </div>
            <div className="grid gap-2">
              <Label>Icon</Label>
              <Select value={data.icon} onValueChange={v => setData('icon', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(opt => {
                    const OptIcon = opt.icon;
                    return (
                      <SelectItem key={opt.name} value={opt.name}>
                        <span className="flex items-center gap-2"><OptIcon className="w-4 h-4" /> {opt.name}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.icon && <div className="text-sm text-destructive">{errors.icon}</div>}
              {selectedIcon && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>Preview:</span>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {(() => { const P = selectedIcon; return <P className="w-5 h-5" />; })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={processing} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              {editing ? "Save Changes" : "Create Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={processing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default SettingsPropertyTypes;
