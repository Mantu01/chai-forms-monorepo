import { eq, and, isNull, isNotNull, count } from "drizzle-orm";
import { users, InsertUser, SelectUser } from "../models/user.model";
import { referralCodes } from "../models/referral.model";
import db from "..";

export class UserQuery {
  async findUserByEmail(email: string): Promise<SelectUser | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findUserByGoogleId(googleId: string): Promise<SelectUser | undefined> {
    return db.query.users.findFirst({
      where: eq(users.googleId, googleId),
    });
  }

  async findUserById(id: string): Promise<SelectUser | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async createUser(data: InsertUser): Promise<SelectUser | undefined> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<SelectUser | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async findAllUsers(): Promise<SelectUser[]> {
    return db.query.users.findMany();
  }

  async findUsersBySubscription(isSubscribed: boolean): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: eq(users.isSubscribed, isSubscribed),
    });
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ profileImageUrl: imageUrl })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateSubscriptionStatus(id: string, isSubscribed: boolean): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ isSubscribed })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findUsersWithoutProfileImage(): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: isNull(users.profileImageUrl),
    });
  }

  async countTotalUsers(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count ?? 0;
  }

  async countSubscribedUsers(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isSubscribed, true));
    return result?.count ?? 0;
  }

  async findUsersByCreatedDate(startDate: Date, endDate: Date): Promise<SelectUser[]> {
    return db.query.users.findMany({
      where: and(
        isNotNull(users.createdAt),
      ),
    });
  }

  async updateUserFullName(id: string, fullName: string): Promise<SelectUser | undefined> {
    const [user] = await db.update(users)
      .set({ fullName })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async findUserByEmailPartial(emailPattern: string): Promise<SelectUser[]> {
    return db.query.users.findMany();
  }

  async checkReferralCode(code: string): Promise<boolean> {
    const [referral] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    return !!referral;
  }
}