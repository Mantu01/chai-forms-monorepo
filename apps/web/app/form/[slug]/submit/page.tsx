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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";

interface SubmitPageProps {
  params: Promise<{ slug: string }>;
}

function SubmitFormContent({ params }: SubmitPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
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

  const { data: pages, isLoading: pagesLoading } = trpc.form.getPagesByForm.useQuery(
    { formId: formId || "" },
    { enabled: !!formId }
  );

  const { data: userWorkspaces, isLoading: workspacesLoading } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    { enabled: !!userId && !!form && (form.status !== "published" || form.accessLevel === "private") }
  );

  const { data: formAnswers } = useQuery({
    queryKey: ["formAnswers"],
    queryFn: () => ({} as Record<string, any>),
    initialData: {},
  });

  const uploadFile = trpc.form.uploadFile.useMutation();

  const createSubmission = trpc.submission.createSubmission.useMutation({
    onSuccess: () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("success", "true");
      router.push(nextUrl.pathname + nextUrl.search);
    },
  });

  const isSuccess = searchParams.get("success") === "true";
  const showLoading = formLoading || fieldsLoading || pagesLoading || userLoading || (userId && workspacesLoading);

  if (showLoading) {
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

  const isMember = userWorkspaces?.some((uw) => uw.workspace.id === form.workspaceId) ?? false;

  if (form.status !== "published" && !isMember) {
    if (!userId) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-500">Draft Form</CardTitle>
              <CardDescription className="text-zinc-400">
                This form is currently a draft and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button>Sign In as Member</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="max-w-md w-full text-center space-y-3 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-red-500 font-semibold text-lg">Form Access Restricted</p>
          <p className="text-sm text-zinc-400">This form is currently a draft and cannot be accessed.</p>
        </div>
      </div>
    );
  }

  if (form.accessLevel === "private" && !isMember) {
    if (!userId) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-500">Private Form</CardTitle>
              <CardDescription className="text-zinc-400">
                This form is private and can only be accessed by workspace members.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/auth">
                <Button>Sign In to Workspace</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white text-center py-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-zinc-400">
              You do not have permission to view or submit this form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-400">Only members of the owning workspace are authorized to submit responses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = (form.themeConfig as Record<string, string>) || {};
  const bgColor = theme.backgroundColor || "#09090b";
  const textColor = theme.textColor || "#ffffff";
  const formBgColor = theme.formBackgroundColor || "#18181b";
  const headerBgColor = theme.headerBackgroundColor || "transparent";
  const borderColor = theme.borderColor || "#27272a";
  const primaryColor = theme.primaryColor || "#3f3f46";
  const buttonTextColor = theme.buttonTextColor || "#ffffff";
  const mutedTextColor = theme.mutedTextColor || "#a1a1aa";
  const inputBgColor = theme.inputBackgroundColor || "#27272a";
  const inputTextColor = theme.inputTextColor || "#ffffff";

  const currentPageIndex = Number(searchParams.get("page") || "0");
  const hasPages = pages && pages.length > 0;
  const activePage = hasPages ? pages[currentPageIndex] || pages[0] : null;

  const pageMap: Record<string, any[]> = {};
  if (pages) {
    pages.forEach((p) => {
      pageMap[p.id] = [];
    });
  }

  if (fields) {
    fields.forEach((f) => {
      const pId = f.pageId;
      if (pId && pageMap[pId]) {
        pageMap[pId].push(f);
      } else if (pages && pages.length > 0) {
        const firstPage = pages[0];
        if (firstPage) {
          const firstPageId = firstPage.id;
          if (!pageMap[firstPageId]) {
            pageMap[firstPageId] = [];
          }
          pageMap[firstPageId].push(f);
        }
      } else {
        if (!pageMap["virtual"]) {
          pageMap["virtual"] = [];
        }
        pageMap["virtual"].push(f);
      }
    });
  }

  const activePageFields = hasPages
    ? (activePage ? pageMap[activePage.id] || [] : [])
    : (pageMap["virtual"] || []);

  const isFieldVisible = (field: any, answers: Record<string, any>) => {
    const logic = field.config?.logic?.showIf;
    if (!logic) return true;

    const targetVal = answers[logic.fieldKey];
    if (targetVal === undefined || targetVal === null) return false;

    if (logic.operator === "equals") {
      return String(targetVal) === String(logic.value);
    }
    if (logic.operator === "not_equals") {
      return String(targetVal) !== String(logic.value);
    }
    if (logic.operator === "contains") {
      return String(targetVal).toLowerCase().includes(String(logic.value).toLowerCase());
    }
    return true;
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    queryClient.setQueryData(["formAnswers"], (prev: any) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const validatePage = () => {
    const missing = activePageFields.filter((f) => {
      if (!f.isRequired) return false;
      if (!isFieldVisible(f, formAnswers)) return false;
      const val = formAnswers[f.fieldKey];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      alert(`Please fill in required fields: ${missing.map(f => f.label).join(", ")}`);
      return false;
    }
    return true;
  };

  const handleNextPage = () => {
    if (!validatePage()) return;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("page", String(currentPageIndex + 1));
    router.push(nextUrl.pathname + nextUrl.search);
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("page", String(currentPageIndex - 1));
      router.push(nextUrl.pathname + nextUrl.search);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fields || !formId) return;

    if (!validatePage()) return;

    const fileFields = fields.filter((f) => f.type === "file" && isFieldVisible(f, formAnswers));
    const uploadedFiles = await Promise.all(
      fileFields.map(async (field) => {
        const fileInput = document.getElementById(field.fieldKey) as HTMLInputElement | null;
        const file = fileInput?.files?.[0];
        if (file && file.size > 0) {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
          const res = await uploadFile.mutateAsync({
            fileData: base64Data,
            folder: `submissions_${formId}`
          });
          return { fieldId: field.id, value: res.url };
        }
        return { fieldId: field.id, value: "" };
      })
    );

    const answers = fields.map((field) => {
      if (!isFieldVisible(field, formAnswers)) {
        return { fieldId: field.id, value: "" };
      }
      const uploaded = uploadedFiles.find((u) => u.fieldId === field.id);
      if (uploaded) return uploaded;

      let value = formAnswers[field.fieldKey];
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
      <div className="flex min-h-screen items-center justify-center p-6" style={{ backgroundColor: bgColor, color: textColor }}>
        <Card className="max-w-md w-full text-center py-8 border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-14 w-14 text-emerald-500 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold" style={{ color: textColor }}>Thank You!</CardTitle>
            <CardDescription style={{ color: mutedTextColor }}>
              Your response has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: textColor }}>
              The response has been saved to form: <span className="font-semibold">{form.title}</span>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {userId ? (
              <Link href="/profile">
                <Button style={{ backgroundColor: primaryColor, color: buttonTextColor }}>Back to Profile</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button style={{ backgroundColor: primaryColor, color: buttonTextColor }}>Sign In to ChaiForm</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ backgroundColor: bgColor, color: textColor }}>
      <Card className="max-w-xl w-full border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
        <form onSubmit={handleSubmit}>
          {currentPageIndex === 0 && (
            theme.bannerUrl ? (
              <div className="h-36 w-full overflow-hidden rounded-t-xl border-b" style={{ borderColor }}>
                <img src={theme.bannerUrl} alt="Form Banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 w-full rounded-t-xl border-b bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden" style={{ borderColor }}>
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-600 uppercase">ChaiForm Premium</span>
              </div>
            )
          )}
          <CardHeader style={{ backgroundColor: headerBgColor }}>
            {currentPageIndex > 0 && hasPages && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium font-mono" style={{ color: mutedTextColor }}>
                  Page {currentPageIndex + 1} of {pages.length}
                </span>
                <div className="flex gap-1">
                  {pages.map((_, i) => (
                    <div key={i} className="h-1.5 w-6 rounded-full transition-all" style={{ backgroundColor: i === currentPageIndex ? (primaryColor || "#ffffff") : (borderColor || "#27272a") }} />
                  ))}
                </div>
              </div>
            )}
            {currentPageIndex === 0 ? (
              <div className="space-y-1">
                <CardTitle className="text-2xl font-extrabold tracking-tight" style={{ color: textColor }}>{form.title}</CardTitle>
                {form.description && (
                  <CardDescription style={{ color: mutedTextColor }} className="text-xs leading-relaxed">{form.description}</CardDescription>
                )}
              </div>
            ) : (
              activePage && activePage.title && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold" style={{ color: textColor }}>{activePage.title}</h3>
                  {activePage.description && (
                    <p className="text-3xs leading-relaxed" style={{ color: mutedTextColor }}>{activePage.description}</p>
                  )}
                </div>
              )
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {activePageFields.length > 0 ? (
              activePageFields.map((field) => {
                const visible = isFieldVisible(field, formAnswers);
                if (!visible) return null;

                const currentValue = formAnswers[field.fieldKey] ?? "";
                const options = field.config?.options || [];

                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={field.fieldKey} className="font-semibold text-xs" style={{ color: textColor }}>
                      {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    {field.helperText && (
                      <p className="text-4xs" style={{ color: mutedTextColor }}>{field.helperText}</p>
                    )}

                    {field.type === "textarea" && (
                      <Textarea
                        id={field.fieldKey}
                        name={field.fieldKey}
                        required={field.isRequired}
                        placeholder={field.placeholder || ""}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                        style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                        className="text-xs rounded-lg"
                      />
                    )}

                    {["text", "email", "phone", "number", "url", "date", "time"].includes(field.type) && (
                      <Input
                        id={field.fieldKey}
                        name={field.fieldKey}
                        type={field.type === "phone" ? "tel" : field.type}
                        required={field.isRequired}
                        placeholder={field.placeholder || ""}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                        style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                        className="text-xs rounded-lg h-9"
                      />
                    )}

                    {field.type === "checkbox" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                          id={field.fieldKey}
                          checked={!!currentValue}
                          onCheckedChange={(checked) => handleFieldChange(field.fieldKey, !!checked)}
                        />
                        <Label htmlFor={field.fieldKey} className="text-2xs" style={{ color: mutedTextColor }}>
                          {field.placeholder || "Yes"}
                        </Label>
                      </div>
                    )}

                    {field.type === "select" && (
                      <Select value={currentValue} onValueChange={(val) => handleFieldChange(field.fieldKey, val)}>
                        <SelectTrigger id={field.fieldKey} className="text-xs rounded-lg h-9" style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}>
                          <SelectValue placeholder={field.placeholder || "Select option"} />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}>
                          {options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "radio" && (
                      <RadioGroup value={currentValue} onValueChange={(val) => handleFieldChange(field.fieldKey, val)} className="flex flex-col gap-2 pt-1">
                        {options.map((opt: string) => (
                          <div key={opt} className="flex items-center gap-2">
                            <RadioGroupItem value={opt} id={`opt-${opt}-${field.id}`} />
                            <Label htmlFor={`opt-${opt}-${field.id}`} className="text-2xs" style={{ color: mutedTextColor }}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.type === "multi_select" && (
                      <div className="flex flex-col gap-2 pt-1">
                        {options.map((opt: string) => {
                          const list = Array.isArray(currentValue) ? currentValue : [];
                          const isChecked = list.includes(opt);
                          const toggleOpt = (checked: boolean) => {
                            const newList = checked ? [...list, opt] : list.filter((item: string) => item !== opt);
                            handleFieldChange(field.fieldKey, newList);
                          };
                          return (
                            <div key={opt} className="flex items-center gap-2">
                              <Checkbox
                                id={`check-${opt}-${field.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => toggleOpt(!!checked)}
                              />
                              <Label htmlFor={`check-${opt}-${field.id}`} className="text-2xs" style={{ color: mutedTextColor }}>{opt}</Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {field.type === "rating" && (
                      <div className="flex gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const active = Number(currentValue) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => handleFieldChange(field.fieldKey, star)}
                              className="focus:outline-hidden"
                            >
                              <Star className="h-5 w-5" style={{ color: active ? (primaryColor || "#f59e0b") : borderColor, fill: active ? (primaryColor || "#f59e0b") : "none" }} />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {field.type === "file" && (
                      <Input
                        id={field.fieldKey}
                        name={field.fieldKey}
                        type="file"
                        required={field.isRequired}
                        style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                        className="text-xs rounded-lg h-9 file:text-white file:text-2xs file:bg-zinc-800 file:border-0"
                      />
                    )}

                    {field.type === "matrix" && (
                      <div className="border rounded-lg overflow-x-auto bg-zinc-900/50 mt-1" style={{ borderColor: borderColor }}>
                        <table className="w-full text-[10px]" style={{ color: textColor }}>
                          <thead>
                            <tr className="border-b" style={{ borderColor: borderColor, backgroundColor: inputBgColor }}>
                              <th className="p-2 text-left">Questions</th>
                              {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                                <th key={col} className="p-2 text-center">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(field.config?.matrixRows || ["Speed", "Quality"]).map((row: string) => {
                              const rowVal = currentValue[row] || "";
                              const handleRowChange = (col: string) => {
                                handleFieldChange(field.fieldKey, {
                                  ...currentValue,
                                  [row]: col
                                });
                              };
                              return (
                                <tr key={row} className="border-b last:border-0" style={{ borderColor: borderColor }}>
                                  <td className="p-2 font-medium">{row}</td>
                                  {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                                    <td key={col} className="p-2 text-center">
                                      <input
                                        type="radio"
                                        name={`matrix-${field.id}-${row}`}
                                        checked={rowVal === col}
                                        onChange={() => handleRowChange(col)}
                                        className="accent-primary"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {field.type === "signature" && (
                      <div className="space-y-1">
                        <Input
                          id={field.fieldKey}
                          name={field.fieldKey}
                          type="text"
                          required={field.isRequired}
                          placeholder={field.placeholder || "Type your name to sign"}
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                          style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                          className="text-xs rounded-lg h-9"
                        />
                        {currentValue && (
                          <p className="text-xl p-2 rounded-lg border border-dashed text-center font-serif italic mt-1" style={{ color: primaryColor, borderColor: borderColor }}>
                            {currentValue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 text-center py-4">This page has no fields.</p>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-4" style={{ borderColor: borderColor }}>
            <div>
              {hasPages && currentPageIndex > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  style={{ borderColor: borderColor, color: textColor }}
                  className="rounded-lg h-8 text-2xs"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" /> Back
                </Button>
              )}
            </div>
            <div>
              {hasPages && currentPageIndex < pages.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNextPage}
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                  className="rounded-lg h-8 text-2xs"
                >
                  Next <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={createSubmission.isPending || activePageFields.length === 0}
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                  className="rounded-lg h-8 text-2xs"
                >
                  {createSubmission.isPending ? "Submitting..." : "Submit Response"}
                </Button>
              )}
            </div>
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
