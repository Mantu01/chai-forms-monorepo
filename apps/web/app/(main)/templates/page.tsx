"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Eye, Archive, Send, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { FormRenderer } from "~/components/form/form-renderer";

interface CommentNodeProps {
  comment: any;
  allComments: any[];
  formId: string;
  onReplyAdded: () => void;
}

function useCacheState<T>(key: any[], defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: key,
    queryFn: () => defaultValue,
    initialData: defaultValue,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const setState = (val: T | ((prev: T) => T)) => {
    queryClient.setQueryData(key, (prev: any) => {
      const next = typeof val === "function" ? (val as Function)(prev ?? defaultValue) : val;
      return next;
    });
  };
  return [data as T, setState];
}

function CommentNode({ comment, allComments, formId, onReplyAdded }: CommentNodeProps) {
  const [replyText, setReplyText] = useCacheState(["commentReplyText", comment.id], "");
  const [showReplyForm, setShowReplyForm] = useCacheState(["showCommentReplyForm", comment.id], false);
  const [guestName, setGuestName] = useCacheState(["commentReplyGuestName", comment.id], "");
  const { data: userData } = trpc.auth.me.useQuery();
  const createComment = trpc.comment.createComment.useMutation();

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({
        formId,
        content: replyText,
        parentId: comment.id,
        guestName: userData?.user ? undefined : guestName,
      });
      setReplyText("");
      setShowReplyForm(false);
      onReplyAdded();
      toast.success("Reply added");
    } catch (err) {
      toast.error("Failed to add reply");
    }
  };

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
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-[10px] text-zinc-400 hover:text-white"
          >
            Reply
          </Button>
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="space-y-2 mt-2 bg-zinc-955 p-3 rounded-lg border border-zinc-800">
          {!userData?.user && (
            <Input
              type="text"
              placeholder="Your Name (Guest)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="text-xs h-8 bg-zinc-900 border-zinc-800"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="text-xs bg-zinc-900 border-zinc-800 min-h-[50px] resize-none"
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
        />
      ))}
    </div>
  );
}

interface FormCommentsProps {
  formId: string;
}

function FormComments({ formId }: FormCommentsProps) {
  const { data: comments, refetch } = trpc.comment.getCommentsByForm.useQuery({ formId });
  const [commentText, setCommentText] = useCacheState(["formCommentsText", formId], "");
  const [guestName, setGuestName] = useCacheState(["formCommentsGuestName", formId], "");
  const { data: userData } = trpc.auth.me.useQuery();
  const createComment = trpc.comment.createComment.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({
        formId,
        content: commentText,
        guestName: userData?.user ? undefined : guestName,
      });
      setCommentText("");
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
            placeholder="Your Name (Guest)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="text-xs h-9 bg-zinc-955 border-zinc-800 max-w-xs"
          />
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Share your thoughts about this template..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs bg-zinc-955 border-zinc-800 min-h-[60px]"
          />
          <Button type="submit" className="h-10 self-end px-4 gap-1">
            <Send className="h-3 w-3" />
            <span>Post</span>
          </Button>
        </div>
      </form>

      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const { data: templates, isLoading } = trpc.form.getPublicTemplates.useQuery();
  const { data: workspaces } = trpc.workspace.getUserWorkspaces.useQuery({});
  const { data: archivedTemplates, refetch: refetchArchives } = trpc.form.getArchivedTemplates.useQuery();

  const cloneTemplate = trpc.form.cloneFormTemplate.useMutation();
  const archiveTemplate = trpc.form.archiveTemplate.useMutation();
  const unarchiveTemplate = trpc.form.unarchiveTemplate.useMutation();

  const [previewTemplate, setPreviewTemplate] = useCacheState<any>(["templatesPreviewTemplate"], null);
  const [cloneTargetWorkspace, setCloneTargetWorkspace] = useCacheState(["templatesCloneTargetWorkspace"], "");
  const [cloningFormId, setCloningFormId] = useCacheState(["templatesCloningFormId"], "");

  const { data: previewFields = [] } = trpc.form.getFieldsByForm.useQuery(
    { formId: previewTemplate?.id || "" },
    { enabled: !!previewTemplate?.id }
  );

  const { data: previewPages = [] } = trpc.form.getPagesByForm.useQuery(
    { formId: previewTemplate?.id || "" },
    { enabled: !!previewTemplate?.id }
  );

  const handleClone = async () => {
    if (!cloningFormId || !cloneTargetWorkspace) return;
    try {
      await cloneTemplate.mutateAsync({
        formId: cloningFormId,
        workspaceId: cloneTargetWorkspace,
      });
      toast.success("Template cloned to your workspace successfully");
      setCloningFormId("");
      setCloneTargetWorkspace("");
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

  const handleOpenPreview = (form: any) => {
    setPreviewTemplate(form);
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
            ChaiForm Templates Directory
          </h1>
          <p className="text-zinc-450 text-xs leading-relaxed max-w-lg">
            Choose from professionally constructed structures. Deploy or preview instantly.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {templates?.map(({ form, workspace }) => {
          const isArchived = archivedTemplates?.some((a) => a.form.id === form.id);
          return (
            <Card key={form.id} className="border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-10 w-10 ring-1 ring-zinc-800 shrink-0">
                    {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                    <AvatarFallback className="text-xs bg-zinc-850 text-zinc-300">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">{form.title}</h3>
                      <span className="text-[10px] text-zinc-550 font-mono">By {workspace.name}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">
                      {form.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-3xs text-zinc-450 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-zinc-550 font-mono">ACCESS LEVEL</span>
                    <span className="font-semibold text-zinc-350 capitalize">{form.accessLevel}</span>
                  </div>
                  <div className="flex flex-col border-l border-zinc-800/80 pl-3">
                    <span className="text-zinc-550 font-mono">STYLING</span>
                    <span className="font-semibold text-zinc-350">
                      {(form.themeConfig as any)?.backgroundColor ? "Custom Colors" : "Default styling"}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-zinc-800/80 pl-3">
                    <span className="text-zinc-550 font-mono">CREATED</span>
                    <span className="font-semibold text-zinc-350">{new Date(form.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPreview(form)}
                    className="h-8 text-3xs gap-1 rounded-xl"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleArchiveToggle(form.id)}
                    className={`h-8 text-3xs gap-1 rounded-xl ${isArchived ? "text-primary hover:text-primary/95" : "text-zinc-500 hover:text-white"}`}
                  >
                    <Archive className="h-3 w-3" />
                    {isArchived ? "Saved" : "Save"}
                  </Button>

                  <Select
                    value=""
                    onValueChange={(val) => {
                      setCloningFormId(form.id);
                      setCloneTargetWorkspace(val);
                    }}
                  >
                    <SelectTrigger className="h-8 w-28 text-3xs bg-zinc-950 border-zinc-850 text-zinc-350 rounded-xl">
                      <SelectValue placeholder="Use Template" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-850 text-white">
                      {workspaces?.map((w) => (
                        <SelectItem key={w.workspace.id} value={w.workspace.id}>
                          {w.workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!cloningFormId} onOpenChange={(open) => { if (!open) setCloningFormId(""); }}>
        <DialogContent className="bg-zinc-950 border-zinc-850 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deploy Template</DialogTitle>
            <DialogDescription>
              This duplicates the form definition, active fields, pages, and theme highlights into your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCloningFormId("")}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={cloneTemplate.isPending}>
              {cloneTemplate.isPending ? "Deploying..." : "Confirm & Deploy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-850 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Template Mock Preview</DialogTitle>
            <DialogDescription className="text-zinc-500 text-3xs">
              Test paging logic, answers validity, and conditional structures. Responses are not recorded.
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6">
              <FormRenderer
                formId={previewTemplate.id}
                form={previewTemplate}
                fields={[...previewFields]}
                pages={[...previewPages]}
                isPreview={true}
              />
              <FormComments formId={previewTemplate.id} />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewTemplate(null)} className="rounded-xl">Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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