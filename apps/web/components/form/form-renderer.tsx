import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface FormRendererProps {
  formId: string;
  form: {
    id: string;
    title: string;
    description?: string | null;
    themeConfig?: any;
  };
  fields: any[];
  pages: any[];
  isPreview?: boolean;
  onSubmit?: (answers: any[]) => void;
  isPending?: boolean;
}

export function FormRenderer({
  formId,
  form,
  fields,
  pages,
  isPreview = false,
  onSubmit,
  isPending = false,
}: FormRendererProps) {
  const queryClient = useQueryClient();

  const { data: pageIndex } = useQuery({
    queryKey: ["formRendererPageIndex", formId],
    queryFn: () => 0,
    initialData: 0,
  });

  const { data: answers } = useQuery({
    queryKey: ["formAnswers", formId],
    queryFn: () => ({} as Record<string, any>),
    initialData: {},
  });

  const { data: isSuccess } = useQuery({
    queryKey: ["formSuccess", formId],
    queryFn: () => false,
    initialData: false,
  });

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

  const hasPages = pages && pages.length > 0;
  const activePage = hasPages ? pages[pageIndex] || pages[0] : null;

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

  const isFieldVisible = (field: any, currentAnswers: Record<string, any>) => {
    const logic = field.config?.logic?.showIf;
    if (!logic) return true;

    const targetVal = currentAnswers[logic.fieldKey];
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
    queryClient.setQueryData(["formAnswers", formId], (prev: any) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const validatePage = () => {
    const missing = activePageFields.filter((f) => {
      if (!f.isRequired) return false;
      if (!isFieldVisible(f, answers)) return false;
      const val = answers[f.fieldKey];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      alert(`Please fill in required fields: ${missing.map((f) => f.label).join(", ")}`);
      return false;
    }
    return true;
  };

  const handleNextPage = () => {
    if (!validatePage()) return;
    queryClient.setQueryData(["formRendererPageIndex", formId], pageIndex + 1);
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      queryClient.setQueryData(["formRendererPageIndex", formId], pageIndex - 1);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePage()) return;

    if (isPreview) {
      queryClient.setQueryData(["formSuccess", formId], true);
      return;
    }

    if (onSubmit) {
      const submissionAnswers = fields.map((field) => {
        if (!isFieldVisible(field, answers)) {
          return { fieldId: field.id, value: "" };
        }
        let value = answers[field.fieldKey];
        if (field.type === "number") {
          value = value ? Number(value) : null;
        }
        return {
          fieldId: field.id,
          value: value ?? "",
        };
      });
      onSubmit(submissionAnswers);
    }
  };

  const handleResetPreview = () => {
    queryClient.setQueryData(["formSuccess", formId], false);
    queryClient.setQueryData(["formRendererPageIndex", formId], 0);
    queryClient.setQueryData(["formAnswers", formId], {});
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center p-6" style={{ backgroundColor: bgColor, color: textColor }}>
        <Card className="max-w-md w-full text-center py-8 border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold" style={{ color: textColor }}>Thank You!</CardTitle>
            <CardDescription style={{ color: mutedTextColor }}>
              {isPreview ? "Your test response validated successfully." : "Your response has been successfully recorded."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: textColor }}>
              The response has been validated for: <span className="font-semibold">{form.title}</span>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {isPreview ? (
              <Button onClick={handleResetPreview} style={{ backgroundColor: primaryColor, color: buttonTextColor }}>Test Again</Button>
            ) : (
              <p className="text-2xs text-muted-foreground">Response Saved.</p>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
      <Card className="max-w-xl w-full border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
        <form onSubmit={handleSubmitForm}>
          {pageIndex === 0 && (
            theme.bannerUrl ? (
              <div className="h-32 w-full overflow-hidden rounded-t-xl border-b" style={{ borderColor }}>
                <img src={theme.bannerUrl} alt="Form Banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-20 w-full rounded-t-xl border-b bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden" style={{ borderColor }}>
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-650 uppercase">ChaiForm Premium</span>
              </div>
            )
          )}
          <CardHeader style={{ backgroundColor: headerBgColor }}>
            {pageIndex > 0 && hasPages && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium font-mono" style={{ color: mutedTextColor }}>
                  Page {pageIndex + 1} of {pages.length}
                </span>
                <div className="flex gap-1">
                  {pages.map((_, i) => (
                    <div key={i} className="h-1 w-5 rounded-full transition-all" style={{ backgroundColor: i === pageIndex ? (primaryColor || "#ffffff") : (borderColor || "#27272a") }} />
                  ))}
                </div>
              </div>
            )}
            {pageIndex === 0 ? (
              <div className="space-y-1">
                <CardTitle className="text-xl font-extrabold tracking-tight" style={{ color: textColor }}>{form.title}</CardTitle>
                {form.description && (
                  <CardDescription style={{ color: mutedTextColor }} className="text-2xs leading-relaxed">{form.description}</CardDescription>
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
                const visible = isFieldVisible(field, answers);
                if (!visible) return null;

                const currentValue = answers[field.fieldKey] ?? "";
                const options = field.config?.options || [];

                return (
                  <div key={field.id} className="space-y-1">
                    <Label htmlFor={field.fieldKey} className="font-semibold text-xs" style={{ color: textColor }}>
                      {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    {field.helperText && (
                      <p className="text-3xs" style={{ color: mutedTextColor }}>{field.helperText}</p>
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
                      <div className="flex items-center gap-2 pt-0.5">
                        <Checkbox
                          id={field.fieldKey}
                          checked={!!currentValue}
                          onCheckedChange={(checked) => handleFieldChange(field.fieldKey, !!checked)}
                        />
                        <Label htmlFor={field.fieldKey} className="text-2xs font-normal" style={{ color: mutedTextColor }}>
                          {field.placeholder || "Confirm"}
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
                      <RadioGroup value={currentValue} onValueChange={(val) => handleFieldChange(field.fieldKey, val)} className="flex flex-col gap-1.5 pt-0.5">
                        {options.map((opt: string) => (
                          <div key={opt} className="flex items-center gap-2">
                            <RadioGroupItem value={opt} id={`opt-${opt}-${field.id}`} />
                            <Label htmlFor={`opt-${opt}-${field.id}`} className="text-2xs font-normal" style={{ color: mutedTextColor }}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.type === "multi_select" && (
                      <div className="flex flex-col gap-1.5 pt-0.5">
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
                              <Label htmlFor={`check-${opt}-${field.id}`} className="text-2xs font-normal" style={{ color: mutedTextColor }}>{opt}</Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {field.type === "rating" && (
                      <div className="flex gap-1 pt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const active = Number(currentValue) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => handleFieldChange(field.fieldKey, star)}
                              className="focus:outline-none"
                            >
                              <Star className="h-4.5 w-4.5" style={{ color: active ? (primaryColor || "#f59e0b") : borderColor, fill: active ? (primaryColor || "#f59e0b") : "none" }} />
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
                      <div className="border rounded-lg overflow-x-auto bg-zinc-900/50 mt-0.5" style={{ borderColor: borderColor }}>
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
                                  [row]: col,
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
                          <p className="text-lg p-2 rounded-lg border border-dashed text-center font-serif italic mt-0.5" style={{ color: primaryColor, borderColor: borderColor }}>
                            {currentValue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 text-center py-4 text-xs">This page has no fields.</p>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-3" style={{ borderColor: borderColor }}>
            <div>
              {hasPages && pageIndex > 0 && (
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
              {hasPages && pageIndex < pages.length - 1 ? (
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
                  disabled={isPending || activePageFields.length === 0}
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                  className="rounded-lg h-8 text-2xs"
                >
                  {isPending ? "Submitting..." : isPreview ? "Submit Test" : "Submit Response"}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
