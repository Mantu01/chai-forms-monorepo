"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Logo from "~/components/layout/logo";
import { trpc } from "~/trpc/client";
import { Spinner } from "~/components/ui/spinner";

function AuthForm({ authUrl }: { authUrl: string }) {
  const handleGoogleLogin = () => {
    const input = document.getElementById("referral") as HTMLInputElement | null;
    const referralCode = input?.value?.trim() || "";
    const targetUrl = referralCode
      ? `${authUrl}&state=${encodeURIComponent(referralCode)}`
      : authUrl;
    window.location.href = targetUrl;
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border bg-card/70 shadow-2xl shadow-primary/5 backdrop-blur-md">
      <CardHeader className="flex flex-col items-center gap-4 pb-4 pt-8">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 p-2">
          <Logo />
        </div>
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Chai Form</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to start building intelligent forms with AI
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-6 pb-8">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full gap-3 border-border/80 bg-background py-5 text-sm font-medium shadow-sm transition-all hover:bg-muted/50 hover:shadow-md cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral" className="text-xs font-semibold text-muted-foreground">
            REFERRAL CODE
          </Label>
          <Input
            id="referral"
            placeholder="Enter your referral code"
            className="border-border/80 bg-background/50 text-sm placeholder:text-xs focus-visible:ring-primary"
          />
          <p className="text-xs leading-snug text-muted-foreground">
            If you&apos;re new to Chai Form, add a referral code and get the <span className="font-semibold text-foreground">Pro version</span> for free.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  const { data: providers, isLoading } = trpc.auth.getSupportedAuthenticationProviders.useQuery();
  const googleProvider = providers?.find((p) => p.provider === "GOOGLE_OAUTH");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Spinner />
      </div>
    );
  }

  if (!googleProvider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="border-destructive/40 bg-destructive/5 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-destructive">
              Google authentication is not configured on the backend.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background px-4 py-12">
      <AuthForm authUrl={googleProvider.authUrl} />
    </div>
  );
}