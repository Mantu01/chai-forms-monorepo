import { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import GenerateForm from "~/components/ai-builder/generate-form";


const fieldSchema = z.object({
  type: z.enum(["text", "textarea", "email", "phone", "number", "select", "multi_select", "radio", "checkbox", "date", "time", "file", "rating", "matrix"]).describe("The UI input element type for the form field"),
  label: z.string().max(255).describe("The visible text label displayed to the user for this input"),
  placeholder: z.string().nullable().optional().describe("Temporary hint text shown inside the input before the user enters a value"),
  helperText: z.string().nullable().optional().describe("Sub-text or instructions displayed below the input to guide the user"),
  fieldKey: z.string().max(255).describe("The unique programmatic key/slug used to identify this field's data in the form submission payload"),
  defaultValue: z.string().nullable().optional().describe("The initial value pre-filled into the field when the form loads"),
  isRequired: z.boolean().default(false).describe("Whether this field must be filled out before the form can be submitted"),
  order: z.number().int().describe("The sequential position of this field relative to other fields on the same page"),
  config: z.object({
    options: z.array(z.string()).optional().describe("Options for select, multi_select, radio, or checkbox fields"),
    matrixRows: z.array(z.string()).optional().describe("Rows for matrix field"),
    matrixCols: z.array(z.string()).optional().describe("Columns for matrix field"),
  }).nullable().optional().describe("Configuration for field-specific options or rules"),
});

export const pageSchema = z.object({
  title:z.string().describe("Title of the fomr"),
  description:z.string().describe("Descripton of the form"),
  pages:z.array(
    z.object({
      currentState:z.string().describe("Single word status like Thinking, Crafting, Finalizing, etc."),
      title: z.string().max(255).nullable().optional().describe('Title for the page'),
      description: z.string().nullable().optional().describe('Short Description about the page'),
      order: z.number().int().describe("Order of the sequence of form page in the form"),
      fields: z.array(fieldSchema).describe('All the fields present in the form page'),
    })
  )
});

export const components: TamboComponent[] = [
  {
    name: "GeneratedPage",
    description:
      "Render generated form pages with fields. Always use this component for form generation.",
    component: GenerateForm,
    propsSchema: pageSchema,
  },
];


export type PageSchemaType = z.infer<typeof pageSchema>;