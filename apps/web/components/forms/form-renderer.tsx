"use client";

import { FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface FormRendererProps {
  form: any;
  pages: readonly any[];
  fields: readonly any[];
  currentPageIndex: number;
  onPageChange: (newPageIndex: number) => void;
  formAnswers: Record<string, any>;
  onAnswerChange: (fieldKey: string, value: any) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  isPreview?: boolean;
}

export function FormRenderer({
  form,
  pages,
  fields,
  currentPageIndex,
  onPageChange,
  formAnswers,
  onAnswerChange,
  onSubmit,
  isSubmitting = false,
  isPreview = false,
}: FormRendererProps) {
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

  const validatePage = () => {
    const missing = activePageFields.filter((f) => {
      if (!f.isRequired) return false;
      if (!isFieldVisible(f, formAnswers)) return false;
      const val = formAnswers[f.fieldKey];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.map((f) => f.label).join(", ")}`);
      return false;
    }
    return true;
  };

  const handleNextPage = () => {
    if (!validatePage()) return;
    onPageChange(currentPageIndex + 1);
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      onPageChange(currentPageIndex - 1);
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validatePage()) return;
    onSubmit(e);
  };

  return (
    <Card className="w-full border" style={{ backgroundColor: formBgColor, borderColor: borderColor }}>
      <form onSubmit={handleFormSubmit}>
        {currentPageIndex === 0 && (
          theme.bannerUrl ? (
            <div className="h-32 w-full overflow-hidden rounded-t-xl border-b" style={{ borderColor }}>
              <img src={theme.bannerUrl} alt="Form Banner" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-20 w-full rounded-t-xl border-b bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden" style={{ borderColor }}>
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-650 uppercase">ChaiForm Premium</span>
            </div>
          )
        )}
        <CardHeader style={{ backgroundColor: headerBgColor }} className="p-4">
          {currentPageIndex > 0 && hasPages && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium font-mono" style={{ color: mutedTextColor }}>
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <div className="flex gap-1">
                {pages.map((_, i) => (
                  <div key={i} className="h-1 w-4 rounded-full transition-all" style={{ backgroundColor: i === currentPageIndex ? (primaryColor || "#ffffff") : (borderColor || "#27272a") }} />
                ))}
              </div>
            </div>
          )}
          {currentPageIndex === 0 ? (
            <div className="space-y-1">
              <CardTitle className="text-base font-extrabold tracking-tight" style={{ color: textColor }}>{form.title}</CardTitle>
              {form.description && (
                <CardDescription style={{ color: mutedTextColor }} className="text-xs leading-relaxed">{form.description}</CardDescription>
              )}
            </div>
          ) : (
            activePage && activePage.title && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold" style={{ color: textColor }}>{activePage.title}</h3>
                {activePage.description && (
                  <p className="text-[10px] leading-relaxed" style={{ color: mutedTextColor }}>{activePage.description}</p>
                )}
              </div>
            )
          )}
        </CardHeader>

        <CardContent className="space-y-3 p-4">
          {activePageFields.length > 0 ? (
            activePageFields.map((field) => {
              const visible = isFieldVisible(field, formAnswers);
              if (!visible) return null;

              const currentValue = formAnswers[field.fieldKey] ?? "";
              const options = field.config?.options || [];

              return (
                <div key={field.id} className="space-y-1">
                  <Label htmlFor={field.fieldKey} className="font-semibold text-xs" style={{ color: textColor }}>
                    {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                  </Label>
                  {field.helperText && (
                    <p className="text-[10px]" style={{ color: mutedTextColor }}>{field.helperText}</p>
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      id={field.fieldKey}
                      name={field.fieldKey}
                      required={field.isRequired}
                      placeholder={field.placeholder || ""}
                      value={currentValue}
                      onChange={(e) => onAnswerChange(field.fieldKey, e.target.value)}
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
                      onChange={(e) => onAnswerChange(field.fieldKey, e.target.value)}
                      style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                      className="text-xs rounded-lg h-8"
                    />
                  )}

                  {field.type === "checkbox" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox
                        id={field.fieldKey}
                        checked={!!currentValue}
                        onCheckedChange={(checked) => onAnswerChange(field.fieldKey, !!checked)}
                      />
                      <Label htmlFor={field.fieldKey} className="text-xs" style={{ color: mutedTextColor }}>
                        {field.placeholder || "Yes"}
                      </Label>
                    </div>
                  )}

                  {field.type === "select" && (
                    <Select value={currentValue} onValueChange={(val) => onAnswerChange(field.fieldKey, val)}>
                      <SelectTrigger id={field.fieldKey} className="text-xs rounded-lg h-8" style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}>
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
                    <RadioGroup value={currentValue} onValueChange={(val) => onAnswerChange(field.fieldKey, val)} className="flex flex-col gap-1.5 pt-1">
                      {options.map((opt: string) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`opt-${opt}-${field.id}`} />
                          <Label htmlFor={`opt-${opt}-${field.id}`} className="text-xs" style={{ color: mutedTextColor }}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {field.type === "multi_select" && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {options.map((opt: string) => {
                        const list = Array.isArray(currentValue) ? currentValue : [];
                        const isChecked = list.includes(opt);
                        const toggleOpt = (checked: boolean) => {
                          const newList = checked ? [...list, opt] : list.filter((item: string) => item !== opt);
                          onAnswerChange(field.fieldKey, newList);
                        };
                        return (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox
                              id={`check-${opt}-${field.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => toggleOpt(!!checked)}
                            />
                            <Label htmlFor={`check-${opt}-${field.id}`} className="text-xs" style={{ color: mutedTextColor }}>{opt}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {field.type === "rating" && (
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = Number(currentValue) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => onAnswerChange(field.fieldKey, star)}
                            className="focus:outline-none"
                          >
                            <Star className="h-4 w-4" style={{ color: active ? (primaryColor || "#f59e0b") : borderColor, fill: active ? (primaryColor || "#f59e0b") : "none" }} />
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
                      className="text-xs rounded-lg h-8 file:text-white file:text-xs file:bg-zinc-800 file:border-0"
                    />
                  )}

                  {field.type === "matrix" && (
                    <div className="border rounded-lg overflow-x-auto bg-zinc-900/50 mt-1" style={{ borderColor: borderColor }}>
                      <table className="w-full text-[10px]" style={{ color: textColor }}>
                        <thead>
                          <tr className="border-b" style={{ borderColor: borderColor, backgroundColor: inputBgColor }}>
                            <th className="p-1.5 text-left">Questions</th>
                            {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                              <th key={col} className="p-1.5 text-center">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(field.config?.matrixRows || ["Speed", "Quality"]).map((row: string) => {
                            const rowVal = currentValue[row] || "";
                            const handleRowChange = (col: string) => {
                              onAnswerChange(field.fieldKey, {
                                ...currentValue,
                                [row]: col,
                              });
                            };
                            return (
                              <tr key={row} className="border-b last:border-0" style={{ borderColor: borderColor }}>
                                <td className="p-1.5 font-medium">{row}</td>
                                {(field.config?.matrixCols || ["Poor", "Fair", "Good"]).map((col: string) => (
                                  <td key={col} className="p-1.5 text-center">
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
                        onChange={(e) => onAnswerChange(field.fieldKey, e.target.value)}
                        style={{ backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }}
                        className="text-xs rounded-lg h-8"
                      />
                      {currentValue && (
                        <p className="text-lg p-2 rounded-lg border border-dashed text-center font-serif italic mt-1" style={{ color: primaryColor, borderColor: borderColor }}>
                          {currentValue}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-zinc-550 text-center py-2 text-xs">This page has no fields.</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t p-4" style={{ borderColor: borderColor }}>
          <div>
            {hasPages && currentPageIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                style={{ borderColor: borderColor, color: textColor }}
                className="rounded-lg h-7 text-[10px]"
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
                className="rounded-lg h-7 text-[10px]"
              >
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || activePageFields.length === 0}
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                className="rounded-lg h-7 text-[10px]"
              >
                {isSubmitting ? "Submitting..." : isPreview ? "Preview Complete" : "Submit Response"}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
