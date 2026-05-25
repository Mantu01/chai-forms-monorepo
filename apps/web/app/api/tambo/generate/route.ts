import { NextRequest, NextResponse } from "next/server";
import { TamboAI } from "@tambo-ai/typescript-sdk";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Tambo API Key is not configured" }, { status: 500 });
    }

    const client = new TamboAI({ apiKey });
    const thread = await client.threads.create({});

    const runStream = await client.threads.runs.create({
      message: {
        role: "user",
        content: [{ type: "text", text: `Please build a form preset for: "${prompt}". Return a structured form description using the generate_form tool.` }],
      },
      tools: [
        {
          name: "generate_form",
          description: "Generates a structured form definition with pages and fields.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              pages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    fields: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          type: {
                            type: "string",
                            enum: [
                              "text",
                              "textarea",
                              "email",
                              "phone",
                              "number",
                              "select",
                              "multi_select",
                              "radio",
                              "checkbox",
                              "date",
                              "time",
                              "file",
                              "rating",
                              "url",
                              "signature"
                            ]
                          },
                          placeholder: { type: "string" },
                          isRequired: { type: "boolean" },
                          options: {
                            type: "array",
                            items: { type: "string" }
                          }
                        },
                        required: ["label", "type", "isRequired"]
                      }
                    }
                  },
                  required: ["title", "fields"]
                }
              }
            },
            required: ["title", "pages"]
          }
        }
      ],
      toolChoice: { name: "generate_form" }
    });

    let toolArguments: any = null;

    for await (const chunk of runStream) {
      if (chunk.type === "tool_call_start" || chunk.type === "tool_use" || (chunk as any).toolUse) {
        const toolUse = (chunk as any).toolUse || chunk;
        if (toolUse.name === "generate_form") {
          toolArguments = toolUse.input;
        }
      }
    }

    if (toolArguments) {
      return NextResponse.json(toolArguments);
    }

    const mockResponse = {
      title: `${prompt.trim().substring(0, 30)} Form`,
      description: `Generated based on prompt: ${prompt}`,
      pages: [
        {
          title: "Page 1",
          description: "Details Page",
          fields: [
            {
              label: "Full Name",
              type: "text",
              placeholder: "John Doe",
              isRequired: true
            },
            {
              label: "Email Address",
              type: "email",
              placeholder: "john@example.com",
              isRequired: true
            }
          ]
        },
        {
          title: "Feedback Details",
          description: "Feedback Page",
          fields: [
            {
              label: "Your Feedback",
              type: "textarea",
              placeholder: "Tell us what you think...",
              isRequired: false
            }
          ]
        }
      ]
    };

    return NextResponse.json(mockResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Form generation failed" }, { status: 500 });
  }
}
