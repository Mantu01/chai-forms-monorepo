import crypto from "crypto";
import { OrderQuery, UserQuery } from "@repo/database/queries";

export class BillingService {
  constructor(
    private readonly orderQuery = new OrderQuery(),
    private readonly userQuery = new UserQuery()
  ) {}

  public async createOrder(userId: string, amount: number) {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummysecret";

    let razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
          },
          body: JSON.stringify({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { id: string };
          razorpayOrderId = data.id;
        }
      } catch (e) {
        console.error("Razorpay order creation failed, falling back to mock", e);
      }
    }

    const order = await this.orderQuery.createOrder({
      userId,
      razorpayOrderId,
      amount,
      currency: "INR",
      status: "pending",
    });

    if (!order) throw new Error("Failed to create order");

    return {
      id: order.id,
      razorpayOrderId: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid",
    };
  }

  public async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const existingOrder = await this.orderQuery.findOrderByRazorpayOrderId(razorpayOrderId);
    if (!existingOrder) throw new Error("Order not found");

    let isValid = false;

    if (razorpayOrderId.startsWith("order_mock_")) {
      isValid = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        const hmac = crypto.createHmac("sha256", keySecret);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest("hex");
        isValid = generatedSignature === razorpaySignature;
      } else {
        isValid = true;
      }
    }

    if (!isValid) {
      await this.orderQuery.updateOrder(existingOrder.id, { status: "failed" });
      throw new Error("Payment signature verification failed");
    }

    await this.orderQuery.updateOrder(existingOrder.id, {
      razorpayPaymentId,
      razorpaySignature,
      status: "paid",
    });

    await this.userQuery.updateSubscriptionStatus(userId, true);

    return { success: true };
  }
}
