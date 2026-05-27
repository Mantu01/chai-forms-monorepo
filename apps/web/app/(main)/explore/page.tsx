"use client";

import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Globe, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import Link from "next/link";

export default function ExplorePage() {
  const router = useRouter();
  const { data: publicForms, isLoading } = trpc.form.getPublicForms.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Globe className="h-3 w-3" />
            Explore Forms
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Public Forms Directory
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-lg">
            Discover and interact with public forms created by the community. Click on any form to submit your response.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {publicForms?.map(({ form, workspace }) => {
          return (
            <div
              key={form.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card border border-border rounded-xl gap-3 text-xs hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-7 w-7 ring-1 ring-border shrink-0">
                  {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate text-xs">{form.title}</h4>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">by {workspace.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate max-w-md">{form.description || "No description provided."}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize bg-muted border-border text-muted-foreground">
                  {form.accessLevel}
                </Badge>
                {form.requireAuth && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted border-border text-muted-foreground">
                    Requires Login
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Link href={`/form/${form.slug}/submit`}>
                  <Button
                    size="xs"
                    className="h-7 text-[10px] gap-1 px-3 rounded-lg"
                  >
                    View Form
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
        {publicForms?.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground bg-card rounded-xl border border-border">
            No public forms available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
