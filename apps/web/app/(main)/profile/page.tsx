"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Spinner } from "~/components/ui/spinner";

export default function ProfilePage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;
  
  const userId = user?.id;
  const { data: submissions, isLoading: submissionsLoading } = trpc.submission.getUserSubmissions.useQuery(
    {},
    { enabled: !!userId }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/auth");
    },
  });

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={user.fullName} />}
            <AvatarFallback>{user.fullName ? user.fullName[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/workspaces">
            <Button variant="outline">Go to Workspaces</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-1">
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription className="text-zinc-400">Account metadata details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <div>
              <span className="font-semibold text-zinc-400">User ID:</span>
              <p className="font-mono break-all">{user.id}</p>
            </div>
            <div>
              <span className="font-semibold text-zinc-400">Full Name:</span>
              <p>{user.fullName}</p>
            </div>
            <div>
              <span className="font-semibold text-zinc-400">Email:</span>
              <p>{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-2">
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
            <CardDescription className="text-zinc-400">History of forms you have filled out</CardDescription>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : submissions && submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Submission ID</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-mono text-zinc-300 text-xs">
                        {submission.id}
                      </TableCell>
                      <TableCell className="capitalize text-zinc-300">
                        {submission.status || "Completed"}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">
                        {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : ""}
                      </TableCell>
                      <TableCell>
                        <Link href={`/submissions/${submission.id}`}>
                          <Button size="sm" variant="secondary">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-zinc-500">No submissions found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="flex justify-center space-x-6 text-xs text-zinc-500 pt-8 border-t border-zinc-900">
        <Link href="/about" className="hover:text-zinc-300">About</Link>
        <Link href="/contact" className="hover:text-zinc-300">Contact</Link>
        <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-zinc-300">Terms & Conditions</Link>
      </footer>
    </div>
  );
}
