"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MessageThreadCollapsible } from "~/components/tambo/message-thread-collapsible"

export function MessageThreadWrapper() {
  const iniSugg = [
    {
      id: "suggestion-1",
      title: "Create a form Template",
      description: "Create a from Template",
      detailedSuggestion: "Create a full good form template.",
      messageId: "form-query",
    },
  ];
  const searchParams = useSearchParams()
  const router = useRouter()
  const isOpen = searchParams.get("quick-create") === "true"

  if (!isOpen) return null

  return (
    <div className="h-screen w-full overflow-hidden absolute z-50 backdrop-blur-sm overscroll-none touch-none">
      
      <MessageThreadCollapsible
        initialSuggestions={iniSugg}
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("quick-create")
            params.delete("workspaceSlug")
            const query = params.toString()
            router.replace(query ? `?${query}` : window.location.pathname)
          }
        }}
        defaultOpen={true}
        className="sticky h-[60vh] max-w-[50vw] left-[35%] top-[15%]"
      />
    </div>
  )
}
