import Link from "next/link";
import Logo from "~/components/layout/logo";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <Logo />
        <span className="text-sm font-bold tracking-tight text-muted-foreground">Chai Form</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        <h2 className="text-base font-semibold">Page Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          We couldn&apos;t find the page you are looking for. It may have been moved or deleted.
        </p>
      </div>

      <Button asChild size="sm" className="h-9 px-4 text-xs cursor-pointer">
        <Link href="/dashboard">
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}