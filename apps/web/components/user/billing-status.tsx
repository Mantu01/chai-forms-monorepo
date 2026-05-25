import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface BillingStatusProps {
  isSubscribed: boolean;
}

export function BillingStatus({ isSubscribed }: BillingStatusProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">Subscription Status</CardTitle>
          <Badge variant={isSubscribed ? "default" : "secondary"} className="text-[9px] px-2 py-0.5 rounded-full font-bold">
            {isSubscribed ? "Pro Level" : "Free Tier"}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {isSubscribed ? "Thank you for supporting Chai Form! You have complete access." : "Upgrade to Pro to unlock advanced AI form building, charts, and limits."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5 text-xs border-t border-border/60 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-muted-foreground">Monthly Cost</span>
          <span className="font-medium text-foreground">{isSubscribed ? "$15.00" : "$0.00"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-muted-foreground">Billing Cycle</span>
          <span className="font-medium text-foreground">Monthly billing</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-muted-foreground">Renewal Date</span>
          <span className="font-medium text-foreground">{isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
