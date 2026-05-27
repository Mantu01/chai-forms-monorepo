"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Eye, Archive,Sparkles} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import Link from "next/link";

export default function ArchivedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: archivedTemplates, isLoading, refetch } = trpc.form.getArchivedTemplates.useQuery();
  const { data: workspaces } = trpc.workspace.getUserWorkspaces.useQuery({});
  const cloneTemplate = trpc.form.cloneFormTemplate.useMutation();
  const unarchiveTemplate = trpc.form.unarchiveTemplate.useMutation();
  const cloningFormId = searchParams.get("cloningFormId");
  const cloneTargetWorkspace = searchParams.get("cloneTargetWorkspace");

  const handleClone = async () => {
    if (!cloningFormId || !cloneTargetWorkspace) return;
    try {
      await cloneTemplate.mutateAsync({
        formId: cloningFormId,
        workspaceId: cloneTargetWorkspace,
      });
      toast.success("Template cloned successfully");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("cloningFormId");
      params.delete("cloneTargetWorkspace");
      router.replace(`?${params.toString()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to clone template");
    }
  };

  const handleRemoveArchive = async (formId: string) => {
    try {
      await unarchiveTemplate.mutateAsync({ formId });
      toast.success("Removed template from archived items");
      refetch();
    } catch (err) {
      toast.error("Failed to remove template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="space-y-1">
        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Sparkles className="h-3 w-3" />
          Archived Templates
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight">
          My Saved Templates
        </h1>
        <p className="text-muted-foreground text-xs leading-relaxed max-w-lg">
          These form templates are archived by you. You can preview, clone or remove them at any time.
        </p>
      </div>

      {archivedTemplates?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/20">
          <Archive className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-xs font-semibold">No archived templates found</p>
            <p className="text-[10px] text-muted-foreground mt-1">Go to templates directory and save some form presets.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {archivedTemplates?.map(({ form, workspace }) => (
            <div
              key={form.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card border border-border rounded-xl gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-7 w-7 ring-1 ring-border shrink-0">
                  {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate text-xs">{form.title}</h4>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">by {workspace.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate max-w-md">{form.description || "No description provided."}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize bg-muted border-border text-muted-foreground">
                  {form.accessLevel}
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted border-border text-muted-foreground">
                  {(form.themeConfig as any)?.backgroundColor ? "Custom Styling" : "Default styling"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Link href={`/preview/${form.id}`} target="_blank">
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-7 text-[10px] gap-1 px-2.5 rounded-lg border-border"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                </Link>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => handleRemoveArchive(form.id)}
                  className="h-7 text-[10px] gap-1 px-2.5 rounded-lg text-destructive hover:bg-destructive/10"
                >
                  Remove
                </Button>

                <Select
                  value=""
                  onValueChange={(val) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("cloningFormId", form.id);
                    params.set("cloneTargetWorkspace", val);
                    router.replace(`?${params.toString()}`);
                  }}
                >
                  <SelectTrigger className="h-7 w-28 text-[10px] bg-muted border-border text-foreground rounded-lg">
                    <SelectValue placeholder="Use Template" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-[10px]">
                    {workspaces?.map((w) => (
                      <SelectItem key={w.workspace.id} value={w.workspace.id} className="text-[10px] cursor-pointer">
                        {w.workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!cloningFormId} onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("cloningFormId");
          params.delete("cloneTargetWorkspace");
          router.replace(`?${params.toString()}`);
        }
      }}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Deploy Template</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will duplicate the form structure, theme and questions into your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("cloningFormId");
              params.delete("cloneTargetWorkspace");
              router.replace(`?${params.toString()}`);
            }} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" onClick={handleClone} disabled={cloneTemplate.isPending} className="text-xs cursor-pointer">
              {cloneTemplate.isPending ? "Deploying..." : "Confirm & Deploy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
