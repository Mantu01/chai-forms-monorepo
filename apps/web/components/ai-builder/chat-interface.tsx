import { useTamboThreadInput } from "@tambo-ai/react";

export function ChatInput() {
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={()=>submit()} disabled={isPending}>Send</button>
    </div>
  );
}
