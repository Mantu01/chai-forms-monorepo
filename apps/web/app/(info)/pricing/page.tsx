"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const freeFeatures = [
    "Limit of 3 forms",
    "Basic form fields",
    "Standard submissions response",
    "General community support",
  ];

  const proFeatures = [
    "Unlimited form creation",
    "Real-time AI form builder",
    "Conditional logic branching",
    "Base64 file uploads storage",
    "90d telemetry logs dashboard",
    "RBAC permissions inside workspaces",
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your needs. Start for free, upgrade when you need more power.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="bg-card border-border flex flex-col justify-between">
          <div>
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold">Starter Plan</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                ₹0
                <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {freeFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </CardContent>
          </div>
          <CardFooter className="pt-6">
            <Link href="/sign-in" className="w-full">
              <Button variant="outline" className="w-full h-12 text-base">
                Get Started for Free
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-card border-primary/30 flex flex-col justify-between bg-linear-to-b from-card via-card to-primary/5 shadow-lg shadow-primary/10">
          <div>
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Professional
                </CardTitle>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Most Popular
                </span>
              </div>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                ₹499
                <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </div>
          <CardFooter className="pt-6">
            <Link href="/sign-up" className="w-full">
              <Button
                className="w-full h-12 text-base bg-gradient-to-tr from-amber-500 to-orange-600 hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
