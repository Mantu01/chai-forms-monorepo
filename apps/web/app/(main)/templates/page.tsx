"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Eye, Copy, Star, ChevronLeft, ChevronRight, CornerDownRight, MessageSquare, Download, FolderHeart, Archive, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";

interface CommentNodeProps {
  comment: any;
  allComments: any[];
  formId: string;
  onReplyAdded: () => void;
}

function CommentNode({ comment, allComments, formId, onReplyAdded }: CommentNodeProps) {
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [guestName, setGuestName] = useState("");
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
        <form onSubmit={handleReplySubmit} className="space-y-2 mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
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
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
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
            className="text-xs h-9 bg-zinc-950 border-zinc-800 max-w-xs"
          />
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Share your thoughts about this template..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs bg-zinc-950 border-zinc-800 min-h-[60px]"
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = trpc.form.getPublicTemplates.useQuery();
  const { data: workspaces } = trpc.workspace.getUserWorkspaces.useQuery();
  const { data: archivedTemplates, refetch: refetchArchives } = trpc.form.getArchivedTemplates.useQuery();

  const cloneTemplate = trpc.form.cloneFormTemplate.useMutation();
  const archiveTemplate = trpc.form.archiveTemplate.useMutation();
  const unarchiveTemplate = trpc.form.unarchiveTemplate.useMutation();

  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [cloneTargetWorkspace, setCloneTargetWorkspace] = useState("");
  const [cloningFormId, setCloningFormId] = useState("");

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

  const handleFieldChange = (fieldKey: string, val: any) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [fieldKey]: val,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Discover Templates
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ChaiForm Public Store
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
            Choose from custom-built, shareable form structures created by other organizations. Deploy or preview instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map(({ form, workspace }) => {
          const isArchived = archivedTemplates?.some((a) => a.form.id === form.id);
          return (
            <Card key={form.id} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <CardHeader className="space-y-3 pb-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-zinc-700">
                    {workspace.logoUrl && <AvatarImage src={workspace.logoUrl} />}
                    <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-300">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-300">{workspace.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-mono">Owner Org</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-white">{form.title}</CardTitle>
                  <CardDescription className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {form.description || "No description provided."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="py-4">
                <div className="flex flex-wrap gap-2 text-2xs text-zinc-400">
                  <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 capitalize">
                    {form.accessLevel}
                  </span>
                  <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    {(form.themeConfig as any)?.backgroundColor ? "Custom Styling" : "Default styling"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center gap-2 border-t border-zinc-800/60 pt-4 pb-4">
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewTemplate(form);
                      setPreviewPage(0);
                      setPreviewAnswers({});
                    }}
                    className="h-8 text-2xs gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleArchiveToggle(form.id)}
                    className={`h-8 text-2xs gap-1 ${isArchived ? "text-primary hover:text-primary/95" : "text-zinc-400 hover:text-white"}`}
                  >
                    <Archive className="h-3 w-3" />
                    {isArchived ? "Archived" : "Archive"}
                  </Button>
                </div>

                <Select
                  value=""
                  onValueChange={(val) => {
                    setCloningFormId(form.id);
                    setCloneTargetWorkspace(val);
                  }}
                >
                  <SelectTrigger className="h-8 w-28 text-2xs bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectValue placeholder="Use Template" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {workspaces?.map((w) => (
                      <SelectItem key={w.workspace.id} value={w.workspace.id}>
                        {w.workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!cloningFormId} onOpenChange={(open) => { if (!open) setCloningFormId(""); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deploy Template</DialogTitle>
            <DialogDescription>
              This will duplicate the form structure, theme and questions into your workspace.
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

      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Template Mock Preview</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Test conditional flows, stars, dropdowns, and multiple fields. Response will not be recorded.
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6">
              <div
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: previewTemplate.themeConfig?.formBackgroundColor || "#18181b",
                  borderColor: previewTemplate.themeConfig?.borderColor || "#27272a",
                }}
              >
                {previewPage === 0 && (
                  previewTemplate.themeConfig?.bannerUrl ? (
                    <div className="h-32 w-full overflow-hidden rounded-t-xl border-b -mt-6 -mx-6 mb-6" style={{ borderColor: previewTemplate.themeConfig?.borderColor || "#27272a" }}>
                      <img src={previewTemplate.themeConfig?.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-full rounded-t-xl border-b -mt-6 -mx-6 mb-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden" style={{ borderColor: previewTemplate.themeConfig?.borderColor || "#27272a" }}>
                      <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-650 uppercase">ChaiForm Premium</span>
                    </div>
                  )
                )}

                <div className="space-y-1 mb-4">
                  {previewPage === 0 ? (
                    <>
                      <h2 className="text-2xl font-bold" style={{ color: previewTemplate.themeConfig?.textColor || "#ffffff" }}>
                        {previewTemplate.title}
                      </h2>
                      {previewTemplate.description && (
                        <p className="text-xs text-zinc-400">{previewTemplate.description}</p>
                      )}
                    </>
                  ) : (
                    <h3 className="text-lg font-bold" style={{ color: previewTemplate.themeConfig?.textColor || "#ffffff" }}>
                      Active Preview Page
                    </h3>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-2xs text-zinc-400 italic">
                    Mock fields preview window. Buttons below navigate page boundaries.
                  </p>
                  <div className="flex gap-2 justify-between border-t border-zinc-800 pt-4 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={previewPage === 0}
                      onClick={() => setPreviewPage(previewPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setPreviewPage(previewPage + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <FormComments formId={previewTemplate.id} />
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewTemplate(null)}>Close Preview</Button>
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