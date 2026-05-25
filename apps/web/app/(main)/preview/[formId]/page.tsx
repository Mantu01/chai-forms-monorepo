"use client";

import React, { use, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { FormRenderer } from "~/components/forms/form-renderer";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, Send, Sparkles } from "lucide-react";

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
      formData.set('replyText','')
      const params = new URLSearchParams(searchParams.toString());
      params.delete("replyToCommentId");
      router.push(`?${params.toString()}`);
      onReplyAdded();
      toast.success("Reply added");
    } catch (err) {
      console.log(err)
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
        <p className="text-xs text-zinc-350 mt-2 leading-relaxed">{comment.content}</p>
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

function FormComments({ formId, router, searchParams }: { formId: string; router: any; searchParams: any }) {
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
      e?.currentTarget?.reset();
      refetch();
      toast.success("Comment posted");
    } catch (err) {
      console.log(err)
      toast.error("Failed to post comment");
    }
  };

  const rootComments = comments?.filter((c) => !c.parentId) || [];

  return (
    <Card className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Community Discussions ({comments?.length || 0})
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
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

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
      </CardContent>
    </Card>
  );
}

function PreviewContent({ formId }: { formId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: form, isLoading: formLoading } = trpc.form.getFormById.useQuery({ formId });
  const { data: pages } = trpc.form.getPagesByForm.useQuery({ formId }, { enabled: !!form });
  const { data: fields } = trpc.form.getFieldsByForm.useQuery({ formId }, { enabled: !!form });

  const { data: currentPageIndex = 0 } = useQuery({
    queryKey: ["previewPageIndex", formId],
    queryFn: () => 0,
    initialData: 0,
  });

  const { data: formAnswers = {} } = useQuery({
    queryKey: ["previewAnswersState", formId],
    queryFn: () => ({}),
    initialData: {},
  });

  if (formLoading || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Live Preview Mode
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {form.title}
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
            Test conditional visibility flows and inputs. Submissions will not be saved.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.close()}
          className="h-8 text-xs border-zinc-800 gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Close Preview</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FormRenderer
            form={form}
            pages={pages || []}
            fields={fields || []}
            currentPageIndex={currentPageIndex}
            onPageChange={(index) => {
              queryClient.setQueryData(["previewPageIndex", formId], index);
            }}
            formAnswers={formAnswers}
            onAnswerChange={(key, val) => {
              queryClient.setQueryData(["previewAnswersState", formId], (prev: any) => ({
                ...prev,
                [key]: val,
              }));
            }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Form validated successfully!");
            }}
            isPreview={true}
          />
        </div>
        <div className="lg:col-span-1">
          <FormComments formId={formId} router={router} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage(props: { params: Promise<{ formId: string }> }) {
  const { formId } = use(props.params);
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><Spinner /></div>}>
      <PreviewContent formId={formId} />
    </Suspense>
  );
}
