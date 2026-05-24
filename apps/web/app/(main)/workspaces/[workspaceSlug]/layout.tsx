import { ReactNode, Suspense } from "react";
import { WorkspaceHeader } from "~/components/layout/workspace-header";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceLayout({ children, params }: LayoutProps) {
  const { workspaceSlug } = await params;

  return (
    <div className="min-h-screen py-1 ">
      <div className="mx-auto w-full flex flex-col gap-5">
        <Suspense
          fallback={
            <div className="flex h-24 items-center justify-center rounded-xl border bg-card">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <WorkspaceHeader slug={workspaceSlug} />
        </Suspense>
        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
}