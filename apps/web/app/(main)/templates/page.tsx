"use client";

import React, { FormEvent, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Eye, Archive, Send, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { FormRenderer } from "~/components/forms/form-renderer";

interface CommentNodeProps {
  comment: any;
  allComments: any[];
  formId: string;
  onReplyAdded: () => void;
  router: any;
  searchParams: any;
}

function CommentNode({ comment, allComments, formId, onReplyAdded, router, searchParams }: CommentNodeProps) {
  const { data: userData } = trpc.auth.me.useQuery();
  const createComment = trpc.comment.createComment.useMutation();

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const replyText = (formData.get("replyText") as string) || "";
    const guestName = (formData.get("guestName") as string) || "";

    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({
        formId,
        content: replyText,
        parentId: comment.id,
        guestName: userData?.user ? undefined : guestName,
      });
      e.currentTarget.reset();
      const params = new URLSearchParams(searchParams.toString());
      params.delete("replyToCommentId");
      router.push(`?${params.toString()}`);
      onReplyAdded();
      toast.success("Reply added");
    } catch (err) {
      toast.error("Failed to add reply");
    }
  };

  const isReplying = searchParams.get("replyToCommentId") === comment.id;
  const displayName = comment.userFullName || comment.guestName || "Anonymous";

  return (
    <div className="space-y-3 pl-4 border-l border-zinc-800 mt-3">
      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {comment.userProfileImageUrl && <AvatarImage src={comment.userProfileImageUrl} />}
              <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-300">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-zinc-200">{displayName}</span>
          </div>
          <span className="text-[10px] text-zinc-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{comment.content}</p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("replyToCommentId", comment.id);
              router.push(`?${params.toString()}`);
            }}
            className="text-[10px] text-zinc-400 hover:text-white"
          >
            Reply
          </Button>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="space-y-2 mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
          {!userData?.user && (
            <Input
              type="text"
              name="guestName"
              placeholder="Your Name (Guest)"
              className="text-xs h-8 bg-zinc-900 border-zinc-800 text-white"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              name="replyText"
              placeholder="Write a reply..."
              className="text-xs bg-zinc-900 border-zinc-800 text-white min-h-[50px] resize-none"
            />
            <Button type="submit" size="sm" className="h-9 self-end">
              Send
            </Button>
          </div>
        </form>
      )}

      {replies.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          allComments={allComments}
          formId={formId}
          onReplyAdded={onReplyAdded}
          router={router}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

interface FormCommentsProps {
  formId: string;
  router: any;
  searchParams: any;
}

function FormComments({ formId, router, searchParams }: FormCommentsProps) {
  const { data: comments, refetch } = trpc.comment.getCommentsByForm.useQuery({ formId });
  const { data: userData } = trpc.auth.me.useQuery();
  const createComment = trpc.comment.createComment.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const commentText = (formData.get("commentText") as string) || "";
    const guestName = (formData.get("guestName") as string) || "";

    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({
        formId,
        content: commentText,
        guestName: userData?.user ? undefined : guestName,
      });
      e.currentTarget.reset();
      refetch();
      toast.success("Comment posted");
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const rootComments = comments?.filter((c) => !c.parentId) || [];

  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-primary" />
        Community Discussions ({comments?.length || 0})
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        {!userData?.user && (
          <Input
            type="text"
            name="guestName"
            placeholder="Your Name (Guest)"
            className="text-xs h-9 bg-zinc-950 border-zinc-800 text-white max-w-xs"
          />
        )}
        <div className="flex gap-2">
          <Textarea
            name="commentText"
            placeholder="Share your thoughts about this template..."
            className="text-xs bg-zinc-950 border-zinc-800 text-white min-h-[60px]"
          />
          <Button type="submit" className="h-10 self-end px-4 gap-1">
            <Send className="h-3 w-3" />
            <span>Post</span>
          </Button>
        </div>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {rootComments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">No discussions yet. Be the first to share your feedback!</p>
        ) : (
          rootComments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              allComments={comments || []}
              formId={formId}
              onReplyAdded={refetch}
              router={router}
              searchParams={searchParams}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = trpc.form.getPublicTemplates.useQuery();
  const { data: workspaces } = trpc.workspace.getUserWorkspaces.useQuery({});
  const { data: archivedTemplates, refetch: refetchArchives } = trpc.form.getArchivedTemplates.useQuery();

  const cloneTemplate = trpc.form.cloneFormTemplate.useMutation();
  const archiveTemplate = trpc.form.archiveTemplate.useMutation();
  const unarchiveTemplate = trpc.form.unarchiveTemplate.useMutation();

  const cloningFormId = searchParams.get("cloningFormId");
  const cloneTargetWorkspace = searchParams.get("cloneTargetWorkspace");

  const handleClone = async () => {
    if (!cloningFormId || !cloneTargetWorkspace) return;
    try {
      await cloneTemplate.mutateAsync({
        formId: cloningFormId,
        workspaceId: cloneTargetWorkspace,
      });
      toast.success("Template cloned to your workspace successfully");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("cloningFormId");
      params.delete("cloneTargetWorkspace");
      router.push(`?${params.toString()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to clone template");
    }
  };

  const handleArchiveToggle = async (formId: string) => {
    const isArchived = archivedTemplates?.some((a) => a.form.id === formId);
    try {
      if (isArchived) {
        await unarchiveTemplate.mutateAsync({ formId });
        toast.success("Removed template from archived items");
      } else {
        await archiveTemplate.mutateAsync({ formId });
        toast.success("Template archived successfully");
      }
      refetchArchives();
    } catch (err) {
      toast.error("Failed to archive template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Discover Templates
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ChaiForm Public Store
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
            Choose from custom-built, shareable form structures created by other organizations. Deploy or preview instantly.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {templates?.map(({ form, workspace }) => {
          const isArchived = archivedTemplates?.some((a) => a.form.id === form.id);
          return (
            <div
              key={form.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-7 w-7 ring-1 ring-zinc-700 shrink-0">
                  {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                  <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-300">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-zinc-100 truncate text-xs">{form.title}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono shrink-0">by {workspace.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-455 truncate max-w-md">{form.description || "No description provided."}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize bg-zinc-950/45 border-zinc-800 text-zinc-400">
                  {form.accessLevel}
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-zinc-950/45 border-zinc-800 text-zinc-400">
                  {(form.themeConfig as any)?.backgroundColor ? "Custom Styling" : "Default styling"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Link href={`/preview/${form.id}`} target="_blank">
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-7 text-[10px] gap-1 px-2.5 rounded-lg border-zinc-800"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                </Link>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => handleArchiveToggle(form.id)}
                  className={`h-7 text-[10px] gap-1 px-2.5 rounded-lg ${isArchived ? "text-primary hover:text-primary/95" : "text-zinc-400 hover:text-white"}`}
                >
                  <Archive className="h-3 w-3" />
                  {isArchived ? "Archived" : "Archive"}
                </Button>

                <Select
                  value=""
                  onValueChange={(val) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("cloningFormId", form.id);
                    params.set("cloneTargetWorkspace", val);
                    router.push(`?${params.toString()}`);
                  }}
                >
                  <SelectTrigger className="h-7 w-28 text-[10px] bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg">
                    <SelectValue placeholder="Use Template" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-[10px]">
                    {workspaces?.map((w) => (
                      <SelectItem key={w.workspace.id} value={w.workspace.id} className="text-[10px]">
                        {w.workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!cloningFormId} onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("cloningFormId");
          params.delete("cloneTargetWorkspace");
          router.push(`?${params.toString()}`);
        }
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Deploy Template</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              This will duplicate the form structure, theme and questions into your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("cloningFormId");
              params.delete("cloneTargetWorkspace");
              router.push(`?${params.toString()}`);
            }} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleClone} disabled={cloneTemplate.isPending} className="text-xs">
              {cloneTemplate.isPending ? "Deploying..." : "Confirm & Deploy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><Spinner /></div>}>
      <TemplatesContent />
    </Suspense>
  );
}