import { ReactNode } from "react";
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
        <WorkspaceHeader slug={workspaceSlug} />
        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
}