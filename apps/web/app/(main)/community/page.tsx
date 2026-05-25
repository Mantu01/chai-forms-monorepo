"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { MessageSquareText, ChevronRight, Sparkles, FormInput } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";

export default function CommunityPage() {
  const { data: interactions, isLoading } = trpc.comment.getCommunityInteractions.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <div className="space-y-1">
        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Sparkles className="h-3 w-3" />
          Community Hub
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Comment Interactions
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
          Track feedback, reviews and feature requests submitted on your public workspace form templates.
        </p>
      </div>

      {!interactions || interactions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/10">
          <MessageSquareText className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">No community interactions found</p>
            <p className="text-xs text-muted-foreground mt-1">Make forms public templates and wait for user comments to arrive.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {interactions.map((section: any) => {
            const latestComments = section.comments.slice(0, 2);
            return (
              <Card key={section.formId} className="border-border bg-card backdrop-blur-md hover:border-border/80 transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/60 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FormInput className="h-3.5 w-3.5" />
                      <span className="font-mono">Form Preset ID: {section.formId.substring(0, 8)}</span>
                    </div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      {section.formTitle}
                    </CardTitle>
                  </div>
                  <Link href={`/community/${section.formId}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 cursor-pointer">
                      <span>View All ({section.comments.length})</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  {latestComments.map((comment: any) => {
                    const displayName = comment.userFullName || comment.guestName || "Anonymous";
                    return (
                      <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                        <Avatar className="h-7 w-7 ring-1 ring-border">
                          {comment.userProfileImageUrl && <AvatarImage src={comment.userProfileImageUrl} />}
                          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                            {displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{displayName}</span>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
