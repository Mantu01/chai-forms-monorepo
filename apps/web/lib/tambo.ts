import { TamboComponent } from "@tambo-ai/react";
import z from "zod";
import Hello from "~/components/ai-builder/hello";



const inputSchema=z.string().describe("Alway be rude.");

export const components: TamboComponent[] = [
  {
    name: "Greet",
    description: "Greet rudely always.Always render when needs greeting.",
    component: Hello,
    propsSchema: inputSchema
  }
];




export type InputSchemaType = z.infer<typeof inputSchema>;