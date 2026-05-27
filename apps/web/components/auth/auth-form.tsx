"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Logo from "~/components/layout/logo";
import { trpc } from "~/trpc/client";
import { Spinner } from "~/components/ui/spinner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

type FormData = {
  fullName: string;
  email: string;
  password: string;
  referralCode: string;
};

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const referralParam = searchParams?.get("ref") || searchParams?.get("referral") || "";
  const fromParam = searchParams?.get("from") || "/profile";

  const { data: providers, isLoading: providersLoading } = trpc.auth.getSupportedAuthenticationProviders.useQuery();
  const googleProvider = providers?.find((p) => p.provider === "GOOGLE_OAUTH");

  const form = useForm<FormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      referralCode: referralParam,
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Successfully logged in!");
      await utils.auth.me.invalidate();
      router.push(fromParam);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to log in");
    },
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      toast.success("Account created successfully!");
      await utils.auth.me.invalidate();
      router.push(fromParam);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign up");
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode === "login") {
      loginMutation.mutate({
        email: data.email,
        password: data.password,
      });
    } else {
      signupMutation.mutate({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode || undefined,
      });
    }
  };

  const handleGoogleLogin = () => {
    if (!googleProvider) {
      toast.error("Google authentication is not configured");
      return;
    }
    const currentRefCode = form.getValues("referralCode")?.trim() || "";
    const targetUrl = currentRefCode
      ? `${googleProvider.authUrl}&state=${encodeURIComponent(currentRefCode)}`
      : googleProvider.authUrl;
    window.location.href = targetUrl;
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <Card className="mx-auto w-full max-w-md border-border bg-card/70 shadow-2xl shadow-primary/5 backdrop-blur-md">
      <CardHeader className="flex flex-col items-center gap-4 pb-4 pt-8">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 p-2">
          <Logo />
        </div>
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to your Chai Form account to continue"
              : "Sign up to start building intelligent forms with AI"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-6 pb-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your name"
                className="border-border/80 bg-background/50 text-sm focus-visible:ring-primary"
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName && (
                <p className="text-xs font-medium text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="border-border/80 bg-background/50 text-sm focus-visible:ring-primary"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-border/80 bg-background/50 text-sm focus-visible:ring-primary"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Referral Code (Optional)
              </Label>
              <Input
                id="referralCode"
                placeholder="Enter your referral code"
                className="border-border/80 bg-background/50 text-sm placeholder:text-xs focus-visible:ring-primary"
                {...form.register("referralCode")}
              />
              <p className="text-[10px] leading-normal text-muted-foreground">
                Enter a referral code to get the <span className="font-semibold text-foreground">Pro version</span> for free.
              </p>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full cursor-pointer py-5 text-sm font-medium shadow-sm transition-all hover:shadow-md mt-2">
            {isPending ? <Spinner className="mr-2" /> : null}
            {mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {googleProvider && !providersLoading ? (
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
        ) : providersLoading ? (
          <div className="flex justify-center py-2">
            <Spinner />
          </div>
        ) : (
          <p className="text-xs text-destructive text-center font-medium">Google Auth is currently disabled</p>
        )}

        <div className="text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign in
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
