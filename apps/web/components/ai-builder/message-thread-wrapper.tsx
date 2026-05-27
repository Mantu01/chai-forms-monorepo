"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MessageThreadCollapsible } from "~/components/tambo/message-thread-collapsible"
import { trpc } from "~/trpc/client"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Sparkles, X } from "lucide-react"
import Link from "next/link"

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

  const { data: userData, isLoading } = trpc.auth.me.useQuery(undefined, { enabled: isOpen });
  const isSubscribed = userData?.user?.isSubscribed;

  if (!isOpen) return null

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("quick-create")
    params.delete("workspaceSlug")
    const query = params.toString()
    router.replace(query ? `?${query}` : window.location.pathname)
  };

  return (
    <div className="h-screen w-full overflow-hidden absolute z-50 backdrop-blur-sm overscroll-none touch-none">
      {!isLoading && !isSubscribed ? (
        <div className="absolute left-[50%] top-[30%] translate-x-[-50%] translate-y-[-50%]">
          <Card className="w-[400px] border-primary/30 shadow-2xl bg-card">
            <CardHeader className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                AI Form Builder
              </CardTitle>
              <CardDescription>
                Unlock the power of real-time AI form generation with a Pro subscription.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Link href="/billings">
                <Button size="sm" className="bg-gradient-to-tr from-amber-500 to-orange-600 hover:opacity-90">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <MessageThreadCollapsible
          initialSuggestions={iniSugg}
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          defaultOpen={true}
          className="sticky h-[60vh] max-w-[50vw] left-[35%] top-[15%]"
        />
      )}
    </div>
  )
}
