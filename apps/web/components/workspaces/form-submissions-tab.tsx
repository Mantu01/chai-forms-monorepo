"use client";

import React from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

interface FormSubmissionsTabProps {
  formId: string;
}

export function FormSubmissionsTab({ formId }: FormSubmissionsTabProps) {
  const { data: submissionsData, isLoading: submissionsLoading } = trpc.submission.getFormSubmissions.useQuery(
    { formId, page: 1, limit: 100 },
    { enabled: !!formId }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold">Submissions Log</h2>
          <p className="text-xs text-muted-foreground">Total records found: {submissionsData?.total || 0}</p>
        </div>
      </div>

      {submissionsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : submissionsData && submissionsData.data.length > 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission No.</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitter ID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionsData.data.map((sub) => (
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
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                      {sub.submittedBy || "Anonymous"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/submissions/${sub.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm">No submissions received for this form yet.</p>
        </div>
      )}
    </div>
  );
}
