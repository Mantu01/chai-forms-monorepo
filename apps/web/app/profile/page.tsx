"use client";

import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/auth");
    },
  });
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }
  if (!data?.user) {
    router.push("/auth");
    return null;
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center p-8 bg-zinc-900 rounded-lg border border-zinc-800 shadow-xl max-w-md w-full">
        {data.user.profileImageUrl && (
          <img
            src={data.user.profileImageUrl}
            alt={data.user.fullName}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/10"
          />
        )}
        <h1 className="text-2xl font-bold mb-2">{data.user.fullName}</h1>
        <p className="text-zinc-400 mb-6">{data.user.email}</p>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="w-full py-2.5 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-medium text-white disabled:opacity-50 pointer-events-auto cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
