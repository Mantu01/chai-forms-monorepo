"use client";

import React from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

interface FormFieldsTabProps {
  formId: string;
  isAdminOrOwner: boolean;
}

export function FormFieldsTab({ formId, isAdminOrOwner }: FormFieldsTabProps) {
  const utils = trpc.useUtils();

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: () => {
      toast.success("Field deleted successfully");
      utils.form.getFieldsByForm.invalidate({ formId });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete field");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold">Form Fields</h2>
          <p className="text-xs text-muted-foreground">Define inputs that users will respond to</p>
        </div>
        {isAdminOrOwner && (
          <Link href="?tab=fields&new-field=true">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </Link>
        )}
      </div>

      {fieldsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : fields && fields.length > 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  {isAdminOrOwner && <TableHead className="w-20 text-right"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, idx) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-mono text-muted-foreground text-center text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-semibold">{field.label}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{field.fieldKey}</TableCell>
                    <TableCell className="capitalize text-xs">{field.type}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-0.5 text-2xs font-semibold rounded ${
                        field.isRequired ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900" : "bg-secondary text-secondary-foreground"
                      }`}>
                        {field.isRequired ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    {isAdminOrOwner && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Delete the field "${field.label}"?`)) {
                              deleteField.mutate({ fieldId: field.id });
                            }
                          }}
                          disabled={deleteField.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm">No fields created inside this form yet.</p>
        </div>
      )}
    </div>
  );
}
