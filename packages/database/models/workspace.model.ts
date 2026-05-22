import {pgTable,uuid,varchar,timestamp,text, primaryKey,} from "drizzle-orm/pg-core"
import { userRoleEnum } from "./enums";
import { users } from "./user.model";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logoUrl: text("logo_url"),

  createdBy: uuid("created_by").references(() => users.id).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});



export const workspaceMembers = pgTable("workspace_members",{
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {onDelete: "cascade",}).notNull(),

  userId: uuid("user_id").references(() => users.id, {onDelete: "cascade",}).notNull(),

  role: userRoleEnum("role").default("member"),

  joinedAt: timestamp("joined_at").defaultNow(),
},
  (t) => [
    primaryKey({
      columns: [t.workspaceId, t.userId],
    }),
  ]
);



export const workspaceInvites = pgTable("workspace_invites", {
  id: uuid("id").defaultRandom().primaryKey(),

  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),

  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("member"),

  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export type SelectWorkspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type SelectWorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type SelectWorkspaceInvite = typeof workspaceInvites.$inferSelect;
export type InsertWorkspaceInvite = typeof workspaceInvites.$inferInsert;
