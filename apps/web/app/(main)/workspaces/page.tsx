import { Suspense } from "react";
import { Spinner } from "~/components/ui/spinner";
import { WorkspacesClient } from "~/components/workspaces/workspace-client";

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <WorkspacesClient />
    </Suspense>
  );
}