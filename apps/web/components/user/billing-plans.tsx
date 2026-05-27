import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

interface BillingPlansProps {
  isSubscribed: boolean;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function BillingPlans({ isSubscribed }: BillingPlansProps) {
  const utils = trpc.useUtils();
  const createOrder = trpc.billing.createOrder.useMutation();
  const verifyPayment = trpc.billing.verifyPayment.useMutation();

  const handleUpgrade = async () => {
    try {
      const order = await createOrder.mutateAsync({ amount: 499 });
      const loaded = await loadRazorpayScript();

      if (!loaded || order.razorpayOrderId.startsWith("order_mock_")) {
        toast.info("Razorpay offline or mock environment detected. Simulating transaction...");
        await verifyPayment.mutateAsync({
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 15)}`,
          razorpaySignature: "mock_signature",
        });
        toast.success("Upgrade Successful!", {
          description: "You now have complete access to all Pro features.",
        });
        utils.auth.me.invalidate();
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "Chai Forms Pro",
        description: "Professional Monthly Plan Subscription",
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await verifyPayment.mutateAsync({
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Upgrade Successful!", {
              description: "You now have complete access to all Pro features.",
            });
            utils.auth.me.invalidate();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#ea580c",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
    }
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card border-border flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Starter Plan</CardTitle>
            <span className="text-lg font-bold mt-1">₹0 <span className="text-2xs text-muted-foreground font-normal">/ month</span></span>
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
            <span className="text-lg font-bold mt-1">₹499 <span className="text-2xs text-muted-foreground font-normal">/ month</span></span>
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
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="w-full text-xs h-8 bg-gradient-to-tr from-amber-500 to-orange-600 hover:opacity-90 transition-opacity"
            disabled={isSubscribed || createOrder.isPending || verifyPayment.isPending}
          >
            {isSubscribed ? "Current Plan" : createOrder.isPending || verifyPayment.isPending ? "Upgrading..." : "Upgrade to Pro"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
