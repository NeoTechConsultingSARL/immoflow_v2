import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { FolderKanban, Plus, Pencil, Trash2, Building2, MapPin, Calendar, Euro, LayoutGrid, FileText, ClipboardList, X } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PropertyType {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

interface ProjectPropertyType {
  property_type_id: number;
  name: string;
  quantity: number;
}

interface Project {
  id: number;
  name: string;
  company_id: number;
  company_name: string;
  address: string;
  description: string;
  status: string;
  budget: number;
  start_date: string;
  property_types: ProjectPropertyType[];
}

const statusStyles: Record<string, string> = {
  "Planning": "bg-blue-500/10 text-blue-600",
  "In Progress": "bg-amber-500/10 text-amber-600",
  "Completed": "bg-emerald-500/10 text-emerald-600",
  "On Hold": "bg-muted text-muted-foreground",
};

const Projects = ({ projects = [], companies = [], propertyTypes = [] }: { projects: Project[], companies: Company[], propertyTypes: PropertyType[] }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const [filterCompany, setFilterCompany] = useState<string>(searchParams.get("company") || "all");

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: "",
    company_id: "",
    address: "",
    description: "",
    status: "Planning",
    budget: "",
    start_date: "",
    property_types: [] as { property_type_id: string, quantity: number }[]
  });

  const openCreate = () => {
    setEditing(null);
    reset();
    clearErrors();
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setData({
      name: p.name,
      company_id: p.company_id.toString(),
      address: p.address || "",
      description: p.description || "",
      status: p.status || "Planning",
      budget: p.budget?.toString() || "",
      start_date: p.start_date || "",
      property_types: p.property_types.map(pt => ({
        property_type_id: pt.property_type_id.toString(),
        quantity: pt.quantity
      }))
    });
    clearErrors();
    setDialogOpen(true);
  };

  const openDelete = (p: Project) => { setDeleting(p); setDeleteOpen(true); };

  const handleSave = () => {
    if (editing) {
      put(route('projects.update', editing.id), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Project updated successfully." });
        },
      });
    } else {
      post(route('projects.store'), {
        onSuccess: () => {
          setDialogOpen(false);
          toast({ title: "Project created successfully." });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleting) {
      destroy(route('projects.destroy', deleting.id), {
        onSuccess: () => {
          setDeleteOpen(false);
          setDeleting(null);
          toast({ title: "Project deleted successfully." });
        },
      });
    }
  };

  const usedPropertyTypes = data.property_types.map(a => a.property_type_id);
  const availablePropertyTypes = propertyTypes.filter(t => !usedPropertyTypes.includes(t.id.toString()));

  const addAllocation = () => {
    if (availablePropertyTypes.length === 0) return;
    setData('property_types', [...data.property_types, { property_type_id: "", quantity: 1 }]);
  };

  const updateAllocation = (index: number, field: 'property_type_id' | 'quantity', value: string | number) => {
    const newAllocations = [...data.property_types];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setData('property_types', newAllocations as any);
  };

  const removeAllocation = (index: number) => {
    const newAllocations = [...data.property_types];
    newAllocations.splice(index, 1);
    setData('property_types', newAllocations);
  };

  const filtered = filterCompany === "all" ? projects : projects.filter(p => p.company_id.toString() === filterCompany);

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
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8 max-w-[1400px] animate-in fade-in slide-in-from-bottom-1 duration-400">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-[1.75rem] xl:text-[2rem] font-bold">All Projects</h2>
                <p className="text-[0.9375rem] text-muted-foreground">Track development projects across your companies.</p>
              </div>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((project, index) => {
                const totalUnits = project.property_types.reduce((sum, pt) => sum + pt.quantity, 0);
                const formatter = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
                const budgetStr = project.budget ? formatter.format(project.budget) : '€0';
                
                return (
                <div
                  key={project.id}
                  className="group bg-card border border-border rounded-xl shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 flex flex-col cursor-pointer"
                  onClick={() => router.visit(route('projects.tranches.index', project.id))}
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <span className={cn("text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full", statusStyles[project.status] || "bg-blue-500/10 text-blue-600")}>
                        {project.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); router.visit(route('projects.tranches.index', project.id)); }}>
                                <LayoutGrid className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Project Management</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); toast({ title: "Printing construction contract..." }); }}>
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print Construction Contract</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); toast({ title: "Printing project technical sheet..." }); }}>
                                <ClipboardList className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print Project Technical Sheet</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); openEdit(project); }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Project</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); openDelete(project); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Project</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold leading-tight mb-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">{project.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{project.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative px-6 py-4 border-t border-border bg-muted/30 group-hover:bg-primary/10 flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: [
                        'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                        'linear-gradient(90deg, hsl(25 80% 55%), hsl(45 90% 55%))',
                        'linear-gradient(90deg, hsl(160 50% 45%), hsl(190 60% 50%))',
                        'linear-gradient(90deg, hsl(270 50% 55%), hsl(300 50% 55%))',
                        'linear-gradient(90deg, hsl(200 60% 50%), hsl(220 55% 55%))',
                        'linear-gradient(90deg, hsl(340 55% 50%), hsl(10 60% 55%))',
                      ][index % 6] }}
                    />
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold">{budgetStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{project.start_date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{totalUnits} units</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-display text-lg font-bold mb-1">No projects found</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a project or adjust your filter.</p>
                <Button onClick={openCreate} className="gap-2" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                  <Plus className="w-4 h-4" /> Add Project
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={data.name} onChange={e => setData("name", e.target.value)} placeholder="e.g. Residenz am Park" />
              {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
            </div>
            <div className="grid gap-2">
              <Label>Company *</Label>
              <Select value={data.company_id} onValueChange={v => setData("company_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.company_id && <div className="text-sm text-destructive">{errors.company_id}</div>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={data.description} onChange={e => setData("description", e.target.value)} placeholder="Brief project description" rows={2} />
              {errors.description && <div className="text-sm text-destructive">{errors.description}</div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={data.status} onValueChange={v => setData("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <div className="text-sm text-destructive">{errors.status}</div>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" step="0.01" value={data.budget} onChange={e => setData("budget", e.target.value)} placeholder="10000000" />
                {errors.budget && <div className="text-sm text-destructive">{errors.budget}</div>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={data.address} onChange={e => setData("address", e.target.value)} placeholder="Street, City" />
                {errors.address && <div className="text-sm text-destructive">{errors.address}</div>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={data.start_date} onChange={e => setData("start_date", e.target.value)} />
                {errors.start_date && <div className="text-sm text-destructive">{errors.start_date}</div>}
              </div>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Property Types</Label>
                {(availablePropertyTypes.length > 0 || data.property_types.some(a => !a.property_type_id)) ? null : (
                  <span className="text-xs text-muted-foreground">All types assigned</span>
                )}
              </div>
              {errors.property_types && <div className="text-sm text-destructive">{errors.property_types}</div>}
              {data.property_types.map((allocation, index) => {
                const otherUsed = data.property_types.filter((_, i) => i !== index).map(a => a.property_type_id).filter(Boolean);
                const optionsForThis = propertyTypes.filter(t => !otherUsed.includes(t.id.toString()));
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={allocation.property_type_id} onValueChange={v => updateAllocation(index, "property_type_id", v)}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {optionsForThis.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      className="w-24"
                      value={allocation.quantity}
                      onChange={e => updateAllocation(index, "quantity", parseInt(e.target.value) || 0)}
                      placeholder="Units"
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeAllocation(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              {(availablePropertyTypes.length > 0 || data.property_types.some(a => !a.property_type_id)) && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 w-fit" onClick={addAllocation}>
                  <Plus className="w-3.5 h-3.5" /> Add Property Type
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={processing} style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              {editing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The project will be permanently removed.</AlertDialogDescription>
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

export default Projects;
