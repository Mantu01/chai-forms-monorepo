export async function generateAIFormDefinition(prompt: string) {
  const res = await fetch("/api/tambo/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to generate form definition");
  }

  return res.json();
}
