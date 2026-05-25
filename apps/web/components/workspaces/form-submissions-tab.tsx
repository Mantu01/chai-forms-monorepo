"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { ArrowUpDown, Eye } from "lucide-react";
import { trpc } from "~/trpc/client";

interface FormSubmissionsTabProps {
  formId: string;
}

export function FormSubmissionsTab({ formId }: FormSubmissionsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBySub") || "newest";
  const activeDetailId = searchParams.get("view-submission");

  const { data: submissionsData, isLoading: submissionsLoading } = trpc.submission.getFormSubmissions.useQuery(
    { formId, page: 1, limit: 100 },
    { enabled: !!formId }
  );

  const { data: activeSubmission, isLoading: activeSubLoading } = trpc.submission.getSubmissionById.useQuery(
    { submissionId: activeDetailId || "" },
    { enabled: !!activeDetailId }
  );

  const { data: fields } = trpc.form.getFieldsByForm.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const sortedSubmissions = React.useMemo(() => {
    if (!submissionsData) return [];
    const list = [...submissionsData.data];
    if (sortBy === "newest") {
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else {
      return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
  }, [submissionsData, sortBy]);

  const renderCollectedValue = (val: any) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") {
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 pl-2 border-l border-border text-2xs">
          {Object.entries(val).map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="font-semibold text-muted-foreground">{k}:</span>
              <span>{String(v)}</span>
            </React.Fragment>
          ))}
        </div>
      );
    }
    return String(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold">Submissions Log</h2>
          <p className="text-xs text-muted-foreground">Total records found: {submissionsData?.total || 0}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`?tab=submissions&sortSub-dialog=true`)}
            className="h-9 gap-1.5"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort</span>
          </Button>
        </div>
      </div>

      {submissionsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : sortedSubmissions.length > 0 ? (
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Submission No.</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold">#{sub.submissionNumber}</TableCell>
                    <TableCell className="text-xs">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="capitalize">
                      <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        sub.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900" :
                        sub.status === "flagged" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-450 border border-red-200 dark:border-red-900" :
                        "bg-secondary text-secondary-foreground"
                      }`}>
                        {sub.status || "completed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`?tab=submissions&view-submission=${sub.id}`)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 border border-dashed border-border/80 rounded-lg">
          <p className="text-muted-foreground text-sm">No submissions received for this form yet.</p>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!activeDetailId} onOpenChange={(open) => { if (!open) router.push(`?tab=submissions`); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Collected responses matching active questions.</DialogDescription>
          </DialogHeader>

          {activeSubLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : activeSubmission ? (
            <div className="space-y-4 py-2">
              {activeSubmission.answers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No answer data collected.</p>
              ) : (
                <div className="space-y-3.5">
                  {activeSubmission.answers.map((ans) => {
                    const matchedField = fields?.find((f) => f.id === ans.fieldId);
                    const questionLabel = matchedField ? matchedField.label : `Field Key: ${ans.fieldId}`;
                    return (
                      <div key={ans.id} className="border-b pb-3 last:border-0 last:pb-0 border-border/40 space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">{questionLabel}</span>
                        <div className="text-xs text-foreground font-medium">
                          {renderCollectedValue(ans.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button onClick={() => router.push(`?tab=submissions`)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Sort Dialog */}
      <Dialog open={searchParams.get("sortSub-dialog") === "true"} onOpenChange={(open) => { if (!open) router.push(`?tab=submissions`); }}>
        <DialogContent className="border-border bg-card/95 backdrop-blur-md sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Sort Submissions</DialogTitle>
            <DialogDescription>Choose log order configuration.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-3">
            {[
              { id: "newest", label: "Newest to Oldest" },
              { id: "oldest", label: "Oldest to Newest" },
            ].map((option) => {
              const isActive = sortBy === option.id;
              return (
                <Button
                  key={option.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => router.push(`?tab=submissions&sortBySub=${option.id}`)}
                  className="justify-start text-xs rounded-xl"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
