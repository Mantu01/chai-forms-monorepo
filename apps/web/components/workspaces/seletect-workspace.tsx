"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { trpc } from "~/trpc/client";

export function SelectWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.me.useQuery();

  const workspaceQuery = useQuery(
    utils.workspace.getUserWorkspaces.queryOptions(
      {},
      {
        enabled: !!user?.user,
      }
    )
  );

  const workspaces = workspaceQuery.data || [];

  const selectedWorkspaceSlug = searchParams.get("workspaceSlug") || "";

  const selectedWorkspace = useMemo(() => {
    return workspaces.find(
      (item) => item.workspace.slug === selectedWorkspaceSlug
    );
  }, [workspaces, selectedWorkspaceSlug]);

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("workspaceSlug", slug);

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      value={selectedWorkspace?.workspace.slug || ""}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-9/10">
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>

      <SelectContent>
        {workspaces.map((item) => (
          <SelectItem
            key={item.workspace.id}
            value={item.workspace.slug}
          >
            {item.workspace.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}