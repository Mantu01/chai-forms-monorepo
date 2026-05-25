"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Calendar, User, MessageSquare, FormInput } from "lucide-react";

interface RecentPublishedForm {
  id: string;
  title: string;
  createdAt: string | Date;
  publishedAt: string | Date | null;
  createdByName: string | null;
  submissionCount: number;
}

interface RecentComment {
  id: string;
  content: string;
  createdAt: string | Date;
  commenterName: string;
  formTitle: string;
}

interface RecentActivityProps {
  recentForms: RecentPublishedForm[];
  recentComments: RecentComment[];
}

export function RecentActivity({ recentForms, recentComments }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 lg:px-6">
      <Card className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <FormInput className="h-4 w-4 text-primary" />
            Recently Published Forms
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            The latest forms published in your workspaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentForms.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No recently published forms.</p>
          ) : (
            recentForms.map((form) => (
              <div key={form.id} className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-semibold text-zinc-200 truncate">{form.title}</h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {form.submissionCount} Submissions
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-450">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {new Date(form.publishedAt || form.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 shrink-0" />
                    {form.createdByName || "Anonymous"}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <MessageSquare className="h-4 w-4 text-primary" />
            Latest Comments
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Recent discussions on forms from your workspaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentComments.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No recent comments.</p>
          ) : (
            recentComments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-1.5">
                <div className="flex justify-between items-start text-[10px] text-zinc-500">
                  <span className="font-semibold text-zinc-300">{comment.commenterName}</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-350 line-clamp-2 leading-relaxed">{comment.content}</p>
                <div className="text-[9px] text-zinc-550 truncate flex items-center gap-1">
                  <span className="font-mono">on {comment.formTitle}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
