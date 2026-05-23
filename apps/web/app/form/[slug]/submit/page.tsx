"use client";

import { use, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";

interface SubmitPageProps {
  params: Promise<{ slug: string }>;
}

import { Suspense } from "react";

function SubmitFormContent({ params }: SubmitPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: userData } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: form, isLoading: formLoading } = trpc.form.getFormBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const formId = form?.id;

  const { data: fields, isLoading: fieldsLoading } = trpc.form.getFieldsByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const createSubmission = trpc.submission.createSubmission.useMutation({
    onSuccess: () => {
      router.push("?success=true");
    },
  });

  const isSuccess = searchParams.get("success") === "true";

  if (formLoading || fieldsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-red-500 font-semibold">Form not found.</p>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fields || !formId) return;

    const formData = new FormData(e.currentTarget);
    const answers = fields.map((field) => {
      let value: any = formData.get(field.fieldKey);
      if (field.type === "number") {
        value = value ? Number(value) : null;
      }
      return {
        fieldId: field.id,
        value: value ?? "",
      };
    });

    createSubmission.mutate({
      formId,
      answers,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-500">Thank You!</CardTitle>
            <CardDescription className="text-zinc-400">
              Your response has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-350 leading-relaxed">
              The response has been saved to form: <span className="font-semibold text-white">{form.title}</span>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {userId ? (
              <Link href="/profile">
                <Button variant="outline">Back to Profile</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button>Sign In to ChaiForm</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
      <Card className="max-w-xl w-full bg-zinc-900 border-zinc-800 text-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-zinc-450">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {fields && fields.length > 0 ? (
              fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.fieldKey} className="text-zinc-300 font-semibold">
                    {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.fieldKey}
                      name={field.fieldKey}
                      required={field.isRequired}
                      placeholder={field.placeholder || ""}
                      defaultValue={field.defaultValue || ""}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-550"
                    />
                  ) : (
                    <Input
                      id={field.fieldKey}
                      name={field.fieldKey}
                      type={field.type}
                      required={field.isRequired}
                      placeholder={field.placeholder || ""}
                      defaultValue={field.defaultValue || ""}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-550"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">This form has no fields and cannot accept submissions.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span className="text-xs text-zinc-550">
              * required fields
            </span>
            <Button type="submit" disabled={createSubmission.isPending || !fields || fields.length === 0}>
              Submit Response
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SubmitFormPage(props: SubmitPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><Spinner /></div>}>
      <SubmitFormContent {...props} />
    </Suspense>
  );
}
