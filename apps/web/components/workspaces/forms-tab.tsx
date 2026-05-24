"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

interface FormsTabProps {
  workspaceId: string;
  workspaceSlug: string;
}

export function FormsTab({ workspaceId, workspaceSlug }: FormsTabProps) {
  const { data: forms, isLoading: formsLoading } = trpc.form.getFormsByWorkspace.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Forms</h2>
        <Link href="?tab=forms&new-form=true">
          <Button>Create Form</Button>
        </Link>
      </div>

      {formsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : forms && forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form) => (
            <Link key={form.id} href={`/workspaces/${workspaceSlug}/form/${form.slug}`}>
              <Card className="hover:shadow-md transition-all h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{form.title}</CardTitle>
                  <CardDescription className="font-mono text-xs">{form.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{form.description || "No description provided."}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                  <span>Status: <span className="capitalize font-semibold">{form.status}</span></span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No forms created inside this workspace yet.</p>
        </div>
      )}
    </div>
  );
}
