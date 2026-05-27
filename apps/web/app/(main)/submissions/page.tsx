"use client";

import { trpc } from "~/trpc/client";
import { Spinner } from "~/components/ui/spinner";
import { ProfileSubmissions } from "~/components/user/profile-submissions";

export default function SubmissionsPage() {
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;
  
  const { data: submissions, isLoading: submissionsLoading } = trpc.submission.getUserSubmissions.useQuery(
    {},
    { enabled: !!userId }
  );

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 lg:px-6 py-6 space-y-6">
      <header className="flex justify-between items-center border-b border-border pb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold tracking-tight">Form Submissions</h1>
          <p className="text-xs text-muted-foreground">History of surveys and forms you completed</p>
        </div>
      </header>

      <div className="space-y-3">
        {submissionsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : submissions && submissions.length > 0 ? (
          <ProfileSubmissions submissions={submissions} />
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-card">
            No submissions found.
          </div>
        )}
      </div>
    </div>
  );
}
