import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BillingPlansProps {
  isSubscribed: boolean;
}

export function BillingPlans({ isSubscribed }: BillingPlansProps) {
  const handleUpgrade = () => {
    toast.success("Mock Checkout: Subscription upgraded successfully!", {
      description: "You now have complete access to all Pro features.",
    });
  };

  const freeFeatures = [
    "Limit of 3 forms",
    "Basic form fields",
    "Standard submissions response",
    "General community support",
  ];

  const proFeatures = [
    "Unlimited form creation",
    "Real-time Tambo AI form builder",
    "Conditional logic branching",
    "Base64 file uploads storage",
    "90d telemetry logs dashboard",
    "RBAC permissions inside workspaces",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card border-border flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Starter Plan</CardTitle>
            <span className="text-lg font-bold mt-1">$0 <span className="text-2xs text-muted-foreground font-normal">/ month</span></span>
          </CardHeader>
          <CardContent className="text-xs space-y-2.5">
            {freeFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </CardContent>
        </div>
        <CardFooter className="pt-3">
          <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled={!isSubscribed}>
            {!isSubscribed ? "Current Plan" : "Downgrade"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-card border-primary/30 flex flex-col justify-between bg-linear-to-b from-card via-card to-primary/5">
        <div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Professional
              </CardTitle>
            </div>
            <span className="text-lg font-bold mt-1">$15 <span className="text-2xs text-muted-foreground font-normal">/ month</span></span>
          </CardHeader>
          <CardContent className="text-xs space-y-2.5">
            {proFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="size-3.5 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
        </div>
        <CardFooter className="pt-3">
          <Button onClick={handleUpgrade} size="sm" className="w-full text-xs h-8" disabled={isSubscribed}>
            {isSubscribed ? "Current Plan" : "Upgrade to Pro"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
