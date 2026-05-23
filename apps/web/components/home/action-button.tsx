"use client";

import Link from "next/link";
import { ArrowRight,  LayoutDashboard, Newspaper } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ActionButtonProps {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "hero" | "section";
}
const isLoggedIn=true;

export default function ActionButton({size = "default",variant = "default",}: ActionButtonProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          asChild
          size={size}
          className={`gap-2 font-semibold tracking-tight shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-px ${variant === "hero" ? "h-11 px-7 text-sm" : variant === "section" ? "h-10 px-6 text-sm" : ""}`}
        >
          <Link href="/dashboard/forms/create">
            <Newspaper className="w-4 h-4" />
            Build a Form
          </Link>
        </Button>
        <Button
          asChild
          size={size}
          variant="outline"
          className={`gap-2 font-medium tracking-tight transition-all duration-200 hover:-translate-y-px ${variant === "hero" ? "h-11 px-7 text-sm" : variant === "section" ? "h-10 px-6 text-sm" : ""}`}
        >
          <Link href="/workspaces">
            <LayoutDashboard className="w-4 h-4" />
            Workspaces
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        asChild
        size={size}
        className={`gap-2 font-semibold tracking-tight shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-px ${variant === "hero" ? "h-11 px-7 text-sm" : variant === "section" ? "h-10 px-6 text-sm" : ""}`}
      >
        <Link href="/sign-up">
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
      <Button
        asChild
        size={size}
        variant="ghost"
        className={`gap-2 font-medium tracking-tight text-muted-foreground hover:text-foreground transition-all duration-200 ${variant === "hero" ? "h-11 px-5 text-sm" : variant === "section" ? "h-10 px-4 text-sm" : ""}`}
      >
        <Link href="/sign-in">
          Sign In
        </Link>
      </Button>
    </div>
  );
}