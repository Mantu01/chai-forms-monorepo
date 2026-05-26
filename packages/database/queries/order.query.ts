import { eq } from "drizzle-orm";
import { orders, InsertOrder, SelectOrder } from "../models/order.model";
import db from "..";

export class OrderQuery {
  async createOrder(data: InsertOrder): Promise<SelectOrder | undefined> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<SelectOrder | undefined> {
    const [order] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return order;
  }

  async findOrderById(id: string): Promise<SelectOrder | undefined> {
    return db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
  }

  async findOrderByRazorpayOrderId(razorpayOrderId: string): Promise<SelectOrder | undefined> {
    return db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, razorpayOrderId),
    });
  }
}
