"use client";

import React, { use } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

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

interface CommunityDetailPageProps {
  params: Promise<{ formId: string }>;
}

interface ReplyItemProps {
  reply: any;
  allComments: any[];
  isAdmin: boolean;
  onDeleted: () => void;
}

function ReplyItem({ reply, allComments, isAdmin, onDeleted }: ReplyItemProps) {
  const deleteComment = trpc.comment.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      onDeleted();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete comment");
    },
  });

  const { data: userData } = trpc.auth.me.useQuery();
  const displayName = reply.userFullName || reply.guestName || "Anonymous";
  const childReplies = allComments.filter((c) => c.parentId === reply.id);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this reply?")) {
      deleteComment.mutate({ commentId: reply.id });
    }
  };

  const showDelete = isAdmin || (userData?.user && reply.userId === userData.user.id);

  return (
    <div className="pl-6 border-l border-zinc-800 mt-4 space-y-3">
      <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/60 flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-6 w-6">
            {reply.userProfileImageUrl && <AvatarImage src={reply.userProfileImageUrl} />}
            <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">{displayName}</span>
              <span className="text-[9px] text-zinc-500">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{reply.content}</p>
          </div>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDelete}
            disabled={deleteComment.isPending}
            className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
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
        />
      ))}
    </div>
  );
}

export default function CommunityDetailPage(props: CommunityDetailPageProps) {
  const { formId } = use(props.params);
  const { data: form } = trpc.form.getFormById.useQuery({ formId });
  const { data: comments, refetch } = trpc.comment.getCommentsByForm.useQuery({ formId });
  const { data: userData } = trpc.auth.me.useQuery();

  const [sortOrder, setSortOrder] = useCacheState<"newest" | "oldest">(["communityDetailSortOrder", formId], "newest");

  const deleteComment = trpc.comment.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully");
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

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment thread?")) {
      deleteComment.mutate({ commentId });
    }
  };

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <Link href="/community">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-zinc-400 hover:text-white mb-2">
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
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {form.title}
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
            Viewing all community interactions for form {form.title}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Sort by:</span>
          <Select
            value={sortOrder}
            onValueChange={(val: any) => setSortOrder(val)}
          >
            <SelectTrigger className="h-8 w-36 text-2xs bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="newest">Latest to Oldest</SelectItem>
              <SelectItem value="oldest">Oldest to Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-2xl bg-zinc-900/10">
            <p className="text-zinc-500 text-sm">No comments have been posted for this form preset yet.</p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const displayName = comment.userFullName || comment.guestName || "Anonymous";
            const replies = comments ? comments.filter((c) => c.parentId === comment.id) : [];
            const showDelete = isWorkspaceAdmin || (userData?.user && comment.userId === userData.user.id);

            return (
              <Card key={comment.id} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 ring-1 ring-zinc-800">
                        {comment.userProfileImageUrl && <AvatarImage src={comment.userProfileImageUrl} />}
                        <AvatarFallback className="text-[10px] bg-zinc-850 text-zinc-400">
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-200">{displayName}</span>
                          <span className="text-[9px] text-zinc-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-350 leading-relaxed font-sans">{comment.content}</p>
                      </div>
                    </div>
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteComment.isPending}
                        className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
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
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
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
