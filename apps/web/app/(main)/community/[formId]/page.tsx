"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface CommunityDetailPageProps {
  params: Promise<{ formId: string }>;
}

interface ReplyItemProps {
  reply: any;
  allComments: any[];
  isAdmin: boolean;
  onDeleted: () => void;
  router: any;
  searchParams: any;
}

function ReplyItem({ reply, allComments, isAdmin, onDeleted, router, searchParams }: ReplyItemProps) {
  const { data: userData } = trpc.auth.me.useQuery();
  const displayName = reply.userFullName || reply.guestName || "Anonymous";
  const childReplies = allComments.filter((c) => c.parentId === reply.id);

  const handleDeleteTrigger = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("deleteCommentId", reply.id);
    router.push(`?${params.toString()}`);
  };

  const showDelete = isAdmin || (userData?.user && reply.userId === userData.user.id);

  return (
    <div className="pl-6 border-l border-border mt-4 space-y-3">
      <div className="bg-muted/30 p-3 rounded-xl border border-border/60 flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-6 w-6">
            {reply.userProfileImageUrl && <AvatarImage src={reply.userProfileImageUrl} />}
            <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{displayName}</span>
              <span className="text-[9px] text-muted-foreground">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">{reply.content}</p>
          </div>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDeleteTrigger}
            className="text-destructive hover:text-destructive/80 h-6 w-6 p-0 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {childReplies.map((c) => (
        <ReplyItem
          key={c.id}
          reply={c}
          allComments={allComments}
          isAdmin={isAdmin}
          onDeleted={onDeleted}
          router={router}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

export default function CommunityDetailPage(props: CommunityDetailPageProps) {
  const { formId } = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: form } = trpc.form.getFormById.useQuery({ formId });
  const { data: comments, refetch } = trpc.comment.getCommentsByForm.useQuery({ formId });
  const { data: userData } = trpc.auth.me.useQuery();

  const sortOrder = (searchParams.get("sort") as "newest" | "oldest") || "newest";

  const deleteComment = trpc.comment.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("deleteCommentId");
      router.push(`?${params.toString()}`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete comment");
    },
  });

  const { data: userWorkspaces } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    { enabled: !!userData?.user && !!form }
  );

  const isWorkspaceAdmin = React.useMemo(() => {
    if (!form || !userWorkspaces) return false;
    const currentWorkspace = userWorkspaces.find((uw) => uw.workspace.id === form.workspaceId);
    return currentWorkspace ? (currentWorkspace.role === "owner" || currentWorkspace.role === "admin") : false;
  }, [form, userWorkspaces]);

  const rootComments = React.useMemo(() => {
    if (!comments) return [];
    const roots = comments.filter((c) => !c.parentId);
    if (sortOrder === "newest") {
      return [...roots].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return [...roots].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }, [comments, sortOrder]);

  const handleDeleteTrigger = (commentId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("deleteCommentId", commentId);
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeDeleteCommentId = searchParams.get("deleteCommentId");

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <Link href="/community">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground mb-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hub</span>
        </Button>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Interactions Board
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {form.title}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
            Viewing all community interactions for form {form.title}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <Select
            value={sortOrder}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-muted border-border text-foreground">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest" className="cursor-pointer">Latest to Oldest</SelectItem>
              <SelectItem value="oldest" className="cursor-pointer">Oldest to Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-2xl bg-muted/10">
            <p className="text-muted-foreground text-sm">No comments have been posted for this form preset yet.</p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const displayName = comment.userFullName || comment.guestName || "Anonymous";
            const replies = comments ? comments.filter((c) => c.parentId === comment.id) : [];
            const showDelete = isWorkspaceAdmin || (userData?.user && comment.userId === userData.user.id);

            return (
              <Card key={comment.id} className="border-border bg-card backdrop-blur-md">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 ring-1 ring-border">
                        {comment.userProfileImageUrl && <AvatarImage src={comment.userProfileImageUrl} />}
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{displayName}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans">{comment.content}</p>
                      </div>
                    </div>
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteTrigger(comment.id)}
                        className="text-destructive hover:text-destructive/80 h-7 w-7 p-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {replies.map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      allComments={comments || []}
                      isAdmin={isWorkspaceAdmin}
                      onDeleted={refetch}
                      router={router}
                      searchParams={searchParams}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={!!activeDeleteCommentId} onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("deleteCommentId");
          router.push(`?${params.toString()}`);
        }
      }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={() => {
                if (activeDeleteCommentId) {
                  deleteComment.mutate({ commentId: activeDeleteCommentId });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
