"use client";

import { use } from "react";
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
      router.replace(`?${params.toString()}`);
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
    <div className="space-y-3 pl-4 border-l border-border mt-3">
      <div className="bg-muted/30 p-3 rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {comment.userProfileImageUrl && <AvatarImage src={comment.userProfileImageUrl} />}
              <AvatarFallback className="text-[10px] text-muted-foreground">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-foreground">{displayName}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{comment.content}</p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("replyToCommentId", comment.id);
              router.replace(`?${params.toString()}`);
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Reply
          </Button>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="space-y-2 mt-2 p-3 rounded-lg border border-border bg-card">
          {!userData?.user && (
            <Input
              type="text"
              name="guestName"
              placeholder="Your Name (Guest)"
              className="text-xs h-8 border-border bg-background"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              name="replyText"
              placeholder="Write a reply..."
              className="text-xs border-border bg-background min-h-12.5 resize-none"
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
    <Card className="border border-border bg-card/30 backdrop-blur-md text-card-foreground">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          Community Discussions ({comments?.length || 0})
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
          {!userData?.user && (
            <Input
              type="text"
              name="guestName"
              placeholder="Your Name (Guest)"
              className="text-xs h-9 border-border bg-background max-w-xs"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              name="commentText"
              placeholder="Share your thoughts about this template..."
              className="text-xs border-border bg-background min-h-15"
            />
            <Button type="submit" className="h-10 self-end px-4 gap-1">
              <Send className="h-3 w-3" />
              <span>Post</span>
            </Button>
          </div>
        </form>

        <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
          {rootComments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No discussions yet. Be the first to share your feedback!</p>
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

interface PreviewPageProps {
  params: Promise<{ formId: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { formId } = use(params);
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2" variant="outline">
            <Sparkles className="h-3 w-3" />
            Live Preview Mode
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {form.title}
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-lg">
            Test conditional visibility flows and inputs. Submissions will not be saved.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.close()}
          className="h-8 text-xs border-border gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Close Preview</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 px-[10%]">
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