import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { Box, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Bloc {
  id: number;
  name: string;
  description: string;
  floors: number;
  properties_count: number;
}

interface Project {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
}

interface Tranche {
  id: number;
  name: string;
}

export default function Blocs({ project, tranche, blocs = [] }: { project: Project, tranche: Tranche, blocs: Bloc[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Bloc | null>(null);
  const [deleting, setDeleting] = useState<Bloc | null>(null);

  const { data, setData, post, put, delete: destroy, processing, reset, clearErrors, errors } = useForm({
    name: "",
    description: "",
    floors: 1,
  });

  const openCreate = () => {
    setEditing(null);
    reset();
    clearErrors();
    setDialogOpen(true);
  };

  const openEdit = (b: Bloc, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(b);
    setData({
      name: b.name,
      description: b.description || "",
      floors: b.floors || 1,
    });
    clearErrors();
    setDialogOpen(true);
  };

  const openDelete = (b: Bloc, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(b);
    setDeleteOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      put(route('projects.tranches.blocs.update', { project: project.id, tranche: tranche.id, bloc: editing.id }), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Bloc updated successfully." });
        },
      });
    } else {
      post(route('projects.tranches.blocs.store', { project: project.id, tranche: tranche.id }), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Bloc created successfully." });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleting) {
      destroy(route('projects.tranches.blocs.destroy', { project: project.id, tranche: tranche.id, bloc: deleting.id }), {
        onSuccess: () => {
          setDeleteOpen(false);
          setDeleting(null);
          toast({ title: "Bloc deleted successfully." });
        },
      });
    }
  };

  const handleBlocClick = (bloc: Bloc) => {
    router.visit(route('blocs.management', bloc.id));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <AppBreadcrumb customItems={[
                { title: "Companies", url: "/companies" },
                { title: project.company?.name || "Company", url: `/projects?company=${project.company?.id || ''}&companyName=${encodeURIComponent(project.company?.name || '')}` },
                { title: project.name, url: route('projects.tranches.index', project.id) },
                { title: tranche.name, url: "" }
              ]} />
            </div>
            <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              <Plus className="w-4 h-4" /> Add Bloc
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8 max-w-[1400px] animate-in fade-in slide-in-from-bottom-1 duration-400">
            <div className="mb-8">
              <h2 className="font-display text-[1.75rem] xl:text-[2rem] font-bold">{tranche.name} — Blocs</h2>
              <p className="text-[0.9375rem] text-muted-foreground">Manage blocs in this tranche. Click a bloc to access project management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {blocs.map((bloc, index) => (
                <div
                  key={bloc.id}
                  onClick={() => handleBlocClick(bloc)}
                  className="group bg-card border border-border rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Box className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => openEdit(bloc, e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => openDelete(bloc, e)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight mb-1">{bloc.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{bloc.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{bloc.floors} floors</span>
                      <span>·</span>
                      <span>{bloc.properties_count || 0} units</span>
                    </div>
                  </div>
                  <div className="relative px-6 py-3 border-t border-border bg-muted/30 group-hover:bg-primary/10 flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: [
                        'linear-gradient(90deg, hsl(200 60% 50%), hsl(220 55% 55%))',
                        'linear-gradient(90deg, hsl(25 80% 55%), hsl(45 90% 55%))',
                        'linear-gradient(90deg, hsl(160 50% 45%), hsl(190 60% 50%))',
                        'linear-gradient(90deg, hsl(270 50% 55%), hsl(300 50% 55%))',
                        'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                        'linear-gradient(90deg, hsl(340 55% 50%), hsl(10 60% 55%))',
                      ][index % 6] }}
                    />
                    <span>Project management</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {blocs.length === 0 && (
              <div className="text-center py-20">
                <Box className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-display text-lg font-bold mb-1">No blocs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a bloc to organize this tranche.</p>
                <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                  <Plus className="w-4 h-4" /> Add Bloc
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? "Edit Bloc" : "New Bloc"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bloc-name">Bloc Name *</Label>
              <Input id="bloc-name" value={data.name} onChange={e => setData("name", e.target.value)} placeholder="e.g. Bloc A1" />
              {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bloc-desc">Description</Label>
              <Textarea id="bloc-desc" value={data.description} onChange={e => setData("description", e.target.value)} placeholder="Brief description" rows={3} />
              {errors.description && <div className="text-sm text-destructive">{errors.description}</div>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bloc-floors">Number of Floors</Label>
              <Input id="bloc-floors" type="number" min={1} value={data.floors} onChange={e => setData("floors", parseInt(e.target.value) || 1)} />
              {errors.floors && <div className="text-sm text-destructive">{errors.floors}</div>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={processing} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>{editing ? "Save Changes" : "Create Bloc"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All units within this bloc will also be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={processing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
