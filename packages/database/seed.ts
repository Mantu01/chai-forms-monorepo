import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const USER_1_ID = "84a86ebf-e14b-4860-936e-213c41ef65b1";
const USER_2_ID = "5a05b382-7774-4b5c-b174-8b63b27b3d30";
const USER_3_ID = "dcd8c843-f111-4770-b9f4-0cd3f02498be";
const USER_4_ID = "f192b45a-c603-4c9b-b0b3-9eb170d740eb";
const USER_5_ID = "0bbfbc31-29e2-411a-be10-85f02bc0f719";
const USER_6_ID = "ae29fa75-1049-411c-aa7f-61122a278912";
const USER_7_ID = "cb327299-c290-410a-8bf8-2cfa0303be1f";
const USER_8_ID = "a8449c2a-9e12-4217-be18-2fe849e779a1";
const USER_9_ID = "bd2b0cfb-c9a4-4a43-9828-98e6ff050c77";
const USER_10_ID = "e9c20a3a-18e3-4c12-a74c-882292f7678f";

const WORK_1_ID = "11a5cb1b-fa3e-46ff-a5bd-6b0be043e7bb";
const WORK_2_ID = "22c2a075-8120-4e31-afcd-98a972fb89a9";
const WORK_3_ID = "33f4a3bf-9e12-4cfd-b2b9-e1e57c6b98ea";
const WORK_4_ID = "44bdc41f-d20a-4bf3-a178-5e6080fb05f7";

const FORM_1_ID = "f1a4e101-de23-455b-80df-5fb8a07c1ef0";
const FORM_2_ID = "f2b5e202-ef34-466c-91e0-6fc9b08d2ef1";
const FORM_3_ID = "f3c6e303-fa45-477d-a2f1-7fd0c09e3ef2";
const FORM_4_ID = "f4d7e404-0ab5-488e-b3f2-8fe1d0af4ef3";
const FORM_5_ID = "f5e8e505-1bc6-499f-c4a3-90f2e0bf5ef4";
const FORM_6_ID = "f6f9e606-2cd7-4aaf-d5b4-01a3f0cf6ef5";

const PAGE_F1_ID = "ab11a22b-cd33-4ef5-8966-1234567890ab";
const PAGE_F2_P1_ID = "cd22b33c-de44-4f66-9877-2345678901bc";
const PAGE_F2_P2_ID = "ef33c44d-ef55-4077-8766-3456789012cd";
const PAGE_F2_P3_ID = "ab44d55e-fa66-4188-7655-4567890123de";
const PAGE_F4_ID = "bc55e66f-ab77-4299-6544-5678901234ef";
const PAGE_F6_ID = "cd66f77a-bc88-43aa-5433-6789012345fa";

const FIELD_F1_RATING = "c011e001-44bb-4ff2-8aa1-1122334455aa";
const FIELD_F1_TEXT = "c011e002-44bb-4ff2-8aa1-1122334455bb";
const FIELD_F1_TEXTAREA = "c011e003-44bb-4ff2-8aa1-1122334455cc";
const FIELD_F1_SELECT = "c011e004-44bb-4ff2-8aa1-1122334455dd";
const FIELD_F1_MULTI = "c011e005-44bb-4ff2-8aa1-1122334455ee";
const FIELD_F1_CHECKBOX = "c011e006-44bb-4ff2-8aa1-1122334455ff";

const FIELD_F2_NAME = "c022e001-55cc-4ff3-9bb2-2233445566aa";
const FIELD_F2_EMAIL = "c022e002-55cc-4ff3-9bb2-2233445566bb";
const FIELD_F2_PHONE = "c022e003-55cc-4ff3-9bb2-2233445566cc";
const FIELD_F2_URL = "c022e004-55cc-4ff3-9bb2-2233445566dd";
const FIELD_F2_YEARS = "c022e005-55cc-4ff3-9bb2-2233445566ee";
const FIELD_F2_RESUME = "c022e006-55cc-4ff3-9bb2-2233445566ff";
const FIELD_F2_DATE = "c022e007-55cc-4ff3-9bb2-223344556611";
const FIELD_F2_TIME = "c022e008-55cc-4ff3-9bb2-223344556622";
const FIELD_F2_RADIO = "c022e009-55cc-4ff3-9bb2-223344556633";
const FIELD_F2_MATRIX = "c022e010-55cc-4ff3-9bb2-223344556644";
const FIELD_F2_SIGNATURE = "c022e011-55cc-4ff3-9bb2-223344556655";

const COMM_1_ID = "d011c001-66aa-4ee2-bb11-1122334455aa";
const COMM_2_ID = "d011c002-66aa-4ee2-bb11-1122334455bb";
const COMM_3_ID = "d011c003-66aa-4ee2-bb11-1122334455cc";

async function main() {
  console.log("🧹 Cleaning out existing database records...");

  await db.delete(schema.submissionAnswers);
  await db.delete(schema.submissions);
  await db.delete(schema.formAnalyticsDaily);
  await db.delete(schema.formViews);
  await db.delete(schema.formComments);
  await db.delete(schema.formThemes);
  await db.delete(schema.archivedTemplates);
  await db.delete(schema.workspaceMembers);
  await db.delete(schema.workspaceInvites);
  await db.delete(schema.formFields);
  await db.delete(schema.formPages);
  await db.delete(schema.forms);
  await db.delete(schema.workspaces);
  await db.delete(schema.orders);
  await db.delete(schema.users);
  await db.delete(schema.referralCodes);

  console.log("✅ Database successfully cleared.");

  console.log("🌱 Seeding referral codes...");
  const refCodes = [
    { code: "CHAI_LAUNCH_50" },
    { code: "EARLY_BIRD_30" },
    { code: "INFLUENCER_GIFT" },
    { code: "WINTER_SALE_20" },
    { code: "PARTNER_VIP_100" }
  ];
  await db.insert(schema.referralCodes).values(refCodes);
  console.log(`✅ Seeded ${refCodes.length} referral codes.`);

  console.log("🌱 Seeding users...");
  const userData = [
    {
      id: USER_1_ID,
      fullName: "Aditya Sharma",
      email: "aditya@chaiforms.com",
      isSubscribed: true,
      emailVerified: true,
      googleId: "google-aditya-12345",
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      createdAt: new Date("2026-01-15T09:00:00Z"),
      updatedAt: new Date("2026-01-15T09:00:00Z")
    },
    {
      id: USER_2_ID,
      fullName: "Sarah Jenkins",
      email: "sarah@chaiforms.com",
      isSubscribed: true,
      emailVerified: true,
      googleId: "google-sarah-67890",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      createdAt: new Date("2026-02-01T10:30:00Z"),
      updatedAt: new Date("2026-02-01T10:30:00Z")
    },
    {
      id: USER_3_ID,
      fullName: "Devon Miller",
      email: "devon@chaiforms.com",
      isSubscribed: false,
      emailVerified: true,
      googleId: null,
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      createdAt: new Date("2026-02-15T14:20:00Z"),
      updatedAt: new Date("2026-02-15T14:20:00Z")
    },
    {
      id: USER_4_ID,
      fullName: "Priya Patel",
      email: "priya@chaiforms.com",
      isSubscribed: true,
      emailVerified: true,
      googleId: "google-priya-11223",
      profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      createdAt: new Date("2026-03-01T11:00:00Z"),
      updatedAt: new Date("2026-03-01T11:00:00Z")
    },
    {
      id: USER_5_ID,
      fullName: "Marcus Aurelius",
      email: "marcus@rome.org",
      isSubscribed: false,
      emailVerified: false,
      googleId: null,
      profileImageUrl: null,
      createdAt: new Date("2026-03-10T08:00:00Z"),
      updatedAt: new Date("2026-03-10T08:00:00Z")
    },
    {
      id: USER_6_ID,
      fullName: "Alice Smith",
      email: "alice@example.com",
      isSubscribed: false,
      emailVerified: true,
      profileImageUrl: null,
      createdAt: new Date("2026-03-15T16:00:00Z")
    },
    {
      id: USER_7_ID,
      fullName: "Bob Johnson",
      email: "bob@example.com",
      isSubscribed: false,
      emailVerified: false,
      profileImageUrl: null,
      createdAt: new Date("2026-03-20T09:45:00Z")
    },
    {
      id: USER_8_ID,
      fullName: "Charlie Brown",
      email: "charlie@example.com",
      isSubscribed: true,
      emailVerified: true,
      profileImageUrl: null,
      createdAt: new Date("2026-04-01T10:00:00Z")
    },
    {
      id: USER_9_ID,
      fullName: "Diana Prince",
      email: "diana@example.com",
      isSubscribed: true,
      emailVerified: true,
      profileImageUrl: null,
      createdAt: new Date("2026-04-05T12:00:00Z")
    },
    {
      id: USER_10_ID,
      fullName: "Evan Wright",
      email: "evan@example.com",
      isSubscribed: false,
      emailVerified: true,
      profileImageUrl: null,
      createdAt: new Date("2026-04-10T14:30:00Z")
    },
    {
      id: "e1fb3c9b-640a-41e9-a3bf-9a3d6a45749f",
      fullName: "Fiona Gallagher",
      email: "fiona@example.com",
      isSubscribed: false,
      emailVerified: true,
      profileImageUrl: null,
      createdAt: new Date("2026-04-15T11:15:00Z")
    },
    {
      id: "ac5f22e7-eb7d-4b9a-bbcb-b219195b0ff7",
      fullName: "George Costanza",
      email: "george@example.com",
      isSubscribed: false,
      emailVerified: false,
      profileImageUrl: null,
      createdAt: new Date("2026-04-20T17:50:00Z")
    }
  ];
  await db.insert(schema.users).values(userData);
  console.log(`✅ Seeded ${userData.length} users.`);

  console.log("🌱 Seeding workspaces...");
  const workspaceData = [
    {
      id: WORK_1_ID,
      name: "Chai Dev Lab",
      slug: "chai-dev-lab",
      logoUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=100",
      createdBy: USER_1_ID,
      createdAt: new Date("2026-01-16T10:00:00Z")
    },
    {
      id: WORK_2_ID,
      name: "Jenkins Marketing Agency",
      slug: "jenkins-marketing",
      logoUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=100",
      createdBy: USER_2_ID,
      createdAt: new Date("2026-02-02T11:00:00Z")
    },
    {
      id: WORK_3_ID,
      name: "Startup Launchpad",
      slug: "startup-launchpad",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=100",
      createdBy: USER_4_ID,
      createdAt: new Date("2026-03-02T12:00:00Z")
    },
    {
      id: WORK_4_ID,
      name: "Open Community Forms",
      slug: "open-community",
      logoUrl: null,
      createdBy: USER_1_ID,
      createdAt: new Date("2026-03-15T09:00:00Z")
    }
  ];
  await db.insert(schema.workspaces).values(workspaceData);
  console.log(`✅ Seeded ${workspaceData.length} workspaces.`);

  console.log("🌱 Seeding workspace members...");
  const workspaceMemberData = [
    { workspaceId: WORK_1_ID, userId: USER_1_ID, name: "Aditya Sharma", role: "owner" as const, joinedAt: new Date("2026-01-16T10:00:00Z") },
    { workspaceId: WORK_1_ID, userId: USER_3_ID, name: "Devon Miller", role: "member" as const, joinedAt: new Date("2026-02-16T11:00:00Z") },
    { workspaceId: WORK_1_ID, userId: USER_5_ID, name: "Marcus Aurelius", role: "admin" as const, joinedAt: new Date("2026-03-11T09:00:00Z") },

    { workspaceId: WORK_2_ID, userId: USER_2_ID, name: "Sarah Jenkins", role: "owner" as const, joinedAt: new Date("2026-02-02T11:00:00Z") },
    { workspaceId: WORK_2_ID, userId: USER_1_ID, name: "Aditya Sharma", role: "admin" as const, joinedAt: new Date("2026-02-05T14:00:00Z") },
    { workspaceId: WORK_2_ID, userId: USER_6_ID, name: "Alice Smith", role: "member" as const, joinedAt: new Date("2026-03-16T10:00:00Z") },

    { workspaceId: WORK_3_ID, userId: USER_4_ID, name: "Priya Patel", role: "owner" as const, joinedAt: new Date("2026-03-02T12:00:00Z") },
    { workspaceId: WORK_3_ID, userId: USER_8_ID, name: "Charlie Brown", role: "member" as const, joinedAt: new Date("2026-04-02T10:00:00Z") },

    { workspaceId: WORK_4_ID, userId: USER_1_ID, name: "Aditya Sharma", role: "owner" as const, joinedAt: new Date("2026-03-15T09:00:00Z") },
    { workspaceId: WORK_4_ID, userId: USER_7_ID, name: "Bob Johnson", role: "member" as const, joinedAt: new Date("2026-03-21T10:00:00Z") }
  ];
  await db.insert(schema.workspaceMembers).values(workspaceMemberData);
  console.log(`✅ Seeded ${workspaceMemberData.length} workspace members.`);

  console.log("🌱 Seeding workspace invites...");
  const workspaceInviteData = [
    {
      workspaceId: WORK_1_ID,
      email: "invitee1@example.com",
      role: "member" as const,
      token: "invite-token-1-abc",
      expiresAt: new Date("2026-06-30T23:59:59Z"),
      createdAt: new Date("2026-05-01T10:00:00Z")
    },
    {
      workspaceId: WORK_2_ID,
      email: "invitee2@example.com",
      role: "admin" as const,
      token: "invite-token-2-xyz",
      expiresAt: new Date("2026-02-10T12:00:00Z"),
      createdAt: new Date("2026-02-03T12:00:00Z")
    },
    {
      workspaceId: WORK_3_ID,
      email: "invitee3@example.com",
      role: "member" as const,
      token: "invite-token-3-qwe",
      expiresAt: new Date("2026-06-15T00:00:00Z"),
      acceptedAt: new Date("2026-05-15T15:00:00Z"),
      createdAt: new Date("2026-05-10T09:00:00Z")
    }
  ];
  await db.insert(schema.workspaceInvites).values(workspaceInviteData);
  console.log(`✅ Seeded ${workspaceInviteData.length} workspace invites.`);

  console.log("🌱 Seeding forms...");
  const defaultThemeConfig = {
    themeName: "dark",
    primaryColor: "#a855f7",
    backgroundColor: "#09090b",
    formBackgroundColor: "#18181b",
    textColor: "#f4f4f5",
    mutedTextColor: "#a1a1aa",
    borderColor: "#27272a"
  };

  const retroThemeConfig = {
    themeName: "retro",
    primaryColor: "#d97706",
    backgroundColor: "#fef3c7",
    formBackgroundColor: "#fffbeb",
    textColor: "#78350f",
    mutedTextColor: "#b45309",
    borderColor: "#f59e0b"
  };

  const oceanThemeConfig = {
    themeName: "ocean",
    primaryColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
    formBackgroundColor: "#ffffff",
    textColor: "#0c4a6e",
    mutedTextColor: "#0284c7",
    borderColor: "#e0f2fe"
  };

  const neonThemeConfig = {
    themeName: "neon",
    primaryColor: "#10b981",
    backgroundColor: "#022c22",
    formBackgroundColor: "#064e3b",
    textColor: "#ecfdf5",
    mutedTextColor: "#34d399",
    borderColor: "#047857"
  };

  const formData = [
    {
      id: FORM_1_ID,
      workspaceId: WORK_1_ID,
      title: "Chai Customer Satisfaction Survey",
      description: "Help us improve our tools by sharing your valuable feedback.",
      slug: "chai-customer-satisfaction",
      status: "published" as const,
      isPublic: true,
      accessLevel: "public",
      createdBy: USER_1_ID,
      allowMultipleSubmissions: false,
      requireAuth: false,
      maxSubmissions: 500,
      redirectUrl: "https://chaiforms.com/thank-you",
      themeConfig: defaultThemeConfig,
      isTemplate: false,
      publishedAt: new Date("2026-01-20T12:00:00Z"),
      createdAt: new Date("2026-01-18T10:00:00Z")
    },
    {
      id: FORM_2_ID,
      workspaceId: WORK_2_ID,
      title: "Senior Full-Stack Engineer Application",
      description: "Join our fast-growing technical product team. This is a multi-page form.",
      slug: "senior-fullstack-job",
      status: "published" as const,
      isPublic: true,
      accessLevel: "public",
      createdBy: USER_2_ID,
      allowMultipleSubmissions: true,
      requireAuth: false,
      maxSubmissions: 200,
      themeConfig: oceanThemeConfig,
      isTemplate: false,
      publishedAt: new Date("2026-02-10T09:00:00Z"),
      createdAt: new Date("2026-02-05T14:30:00Z")
    },
    {
      id: FORM_3_ID,
      workspaceId: WORK_1_ID,
      title: "Developer Meetup RSVP",
      description: "RSVP for our upcoming local developer drinks and showcase meetup.",
      slug: "dev-meetup-rsvp",
      status: "draft" as const,
      isPublic: true,
      accessLevel: "public",
      createdBy: USER_1_ID,
      allowMultipleSubmissions: true,
      requireAuth: true,
      themeConfig: retroThemeConfig,
      isTemplate: false,
      createdAt: new Date("2026-04-15T08:00:00Z")
    },
    {
      id: FORM_4_ID,
      workspaceId: WORK_3_ID,
      title: "SaaS Product Feedback Template",
      description: "A standard template to collect features requests and rating ratings.",
      slug: "saas-feedback-template",
      status: "published" as const,
      isPublic: true,
      accessLevel: "public",
      createdBy: USER_4_ID,
      allowMultipleSubmissions: true,
      themeConfig: neonThemeConfig,
      isTemplate: true,
      publishedAt: new Date("2026-03-05T10:00:00Z"),
      createdAt: new Date("2026-03-03T11:00:00Z")
    },
    {
      id: FORM_5_ID,
      workspaceId: WORK_4_ID,
      title: "Historical Web Form V1",
      description: "Old outdated form archived for compliance reasons.",
      slug: "historical-web-v1",
      status: "archived" as const,
      isPublic: false,
      accessLevel: "restricted",
      createdBy: USER_1_ID,
      themeConfig: defaultThemeConfig,
      isTemplate: false,
      closeAt: new Date("2026-04-01T00:00:00Z"),
      createdAt: new Date("2026-03-16T10:00:00Z")
    },
    {
      id: FORM_6_ID,
      workspaceId: WORK_1_ID,
      title: "Quick JavaScript Knowledge Quiz",
      description: "Test your JS fundamentals in 2 minutes!",
      slug: "js-quick-quiz",
      status: "published" as const,
      isPublic: true,
      accessLevel: "public",
      createdBy: USER_3_ID,
      themeConfig: defaultThemeConfig,
      isTemplate: false,
      publishedAt: new Date("2026-05-01T15:00:00Z"),
      createdAt: new Date("2026-04-28T09:30:00Z")
    }
  ];
  await db.insert(schema.forms).values(formData);
  console.log(`✅ Seeded ${formData.length} forms.`);

  console.log("🌱 Seeding form pages...");
  const formPageData = [
    { id: PAGE_F1_ID, formId: FORM_1_ID, title: "Your Feedback", description: "All questions about your experience", order: 1 },
    { id: PAGE_F2_P1_ID, formId: FORM_2_ID, title: "Personal Details", description: "How we can contact you", order: 1 },
    { id: PAGE_F2_P2_ID, formId: FORM_2_ID, title: "Professional Background", description: "Your experience & achievements", order: 2 },
    { id: PAGE_F2_P3_ID, formId: FORM_2_ID, title: "Technical Preferences", description: "Tech stacks and systems", order: 3 },
    { id: PAGE_F4_ID, formId: FORM_4_ID, title: "Product Features Feedback", description: "Review our current roadmap", order: 1 },
    { id: PAGE_F6_ID, formId: FORM_6_ID, title: "JS Fundamentals", description: "Answer carefully", order: 1 }
  ];
  await db.insert(schema.formPages).values(formPageData);
  console.log(`✅ Seeded ${formPageData.length} form pages.`);

  console.log("🌱 Seeding form fields...");
  const formFieldData = [
    // Form 1 Fields
    {
      id: FIELD_F1_RATING,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Overall Satisfaction Rating",
      placeholder: "Choose a rating from 1 to 5",
      type: "rating" as const,
      fieldKey: "overall_satisfaction",
      isRequired: true,
      order: 1,
      config: { maxStars: 5, lowLabel: "Poor", highLabel: "Excellent" }
    },
    {
      id: FIELD_F1_TEXT,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Key Benefit",
      placeholder: "What was the most positive aspect of your experience?",
      type: "text" as const,
      fieldKey: "key_benefit",
      isRequired: false,
      order: 2,
      config: null
    },
    {
      id: FIELD_F1_TEXTAREA,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Areas to Improve",
      placeholder: "What can we build or fix to serve you better?",
      type: "textarea" as const,
      fieldKey: "areas_to_improve",
      isRequired: false,
      order: 3,
      config: null
    },
    {
      id: FIELD_F1_SELECT,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Usage Frequency",
      placeholder: "Select one option",
      type: "select" as const,
      fieldKey: "usage_frequency",
      isRequired: false,
      order: 4,
      config: { options: ["Daily", "Weekly", "Monthly", "Rarely"] }
    },
    {
      id: FIELD_F1_MULTI,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Favorite Features",
      type: "multi_select" as const,
      fieldKey: "favorite_features",
      isRequired: false,
      order: 5,
      config: { options: ["Form Editor", "Submissions DB", "Theme customizer", "Integrations"] }
    },
    {
      id: FIELD_F1_CHECKBOX,
      formId: FORM_1_ID,
      pageId: PAGE_F1_ID,
      label: "Subscribe to our newsletters and updates",
      defaultValue: "true",
      type: "checkbox" as const,
      fieldKey: "newsletter_subscribed",
      isRequired: false,
      order: 6,
      config: null
    },

    // Form 2 Fields
    {
      id: FIELD_F2_NAME,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P1_ID,
      label: "Full Name",
      placeholder: "John Doe",
      type: "text" as const,
      fieldKey: "full_name",
      isRequired: true,
      order: 1,
      config: null
    },
    {
      id: FIELD_F2_EMAIL,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P1_ID,
      label: "Email Address",
      placeholder: "john.doe@example.com",
      type: "email" as const,
      fieldKey: "email_address",
      isRequired: true,
      order: 2,
      config: null
    },
    {
      id: FIELD_F2_PHONE,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P1_ID,
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      type: "phone" as const,
      fieldKey: "phone_number",
      isRequired: false,
      order: 3,
      config: null
    },
    {
      id: FIELD_F2_URL,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P1_ID,
      label: "LinkedIn Profile URL",
      placeholder: "https://linkedin.com/in/johndoe",
      type: "url" as const,
      fieldKey: "linkedin_url",
      isRequired: false,
      order: 4,
      config: null
    },
    {
      id: FIELD_F2_YEARS,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P2_ID,
      label: "Years of Experience (React/NextJS)",
      placeholder: "e.g. 5",
      type: "number" as const,
      fieldKey: "years_react_experience",
      isRequired: true,
      order: 1,
      config: { min: 0, max: 30 }
    },
    {
      id: FIELD_F2_RESUME,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P2_ID,
      label: "Upload Resume (PDF only)",
      type: "file" as const,
      fieldKey: "resume_file",
      isRequired: true,
      order: 2,
      config: { allowedExtensions: [".pdf"], maxSizeBytes: 5242880 }
    },
    {
      id: FIELD_F2_DATE,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P2_ID,
      label: "Earliest Start Date",
      type: "date" as const,
      fieldKey: "earliest_start_date",
      isRequired: false,
      order: 3,
      config: null
    },
    {
      id: FIELD_F2_TIME,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P2_ID,
      label: "Preferred Call Time (EST)",
      type: "time" as const,
      fieldKey: "preferred_call_time",
      isRequired: false,
      order: 4,
      config: null
    },
    {
      id: FIELD_F2_RADIO,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P3_ID,
      label: "Primary Programming Language",
      type: "radio" as const,
      fieldKey: "primary_language",
      isRequired: true,
      order: 1,
      config: { options: ["TypeScript", "JavaScript", "Rust", "Go"] }
    },
    {
      id: FIELD_F2_MATRIX,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P3_ID,
      label: "Domain Skill Levels",
      type: "matrix" as const,
      fieldKey: "domain_skills",
      isRequired: true,
      order: 2,
      config: {
        rows: ["Frontend Frameworks", "NodeJS / Backend APIs", "Database & SQL", "Cloud & DevOps"],
        columns: ["Beginner", "Intermediate", "Expert"]
      }
    },
    {
      id: FIELD_F2_SIGNATURE,
      formId: FORM_2_ID,
      pageId: PAGE_F2_P3_ID,
      label: "Draw your signature / Type initials to confirm",
      type: "signature" as const,
      fieldKey: "applicant_signature",
      isRequired: true,
      order: 3,
      config: null
    }
  ];
  await db.insert(schema.formFields).values(formFieldData);
  console.log(`✅ Seeded ${formFieldData.length} form fields.`);

  console.log("🌱 Seeding form themes...");
  const formThemeData = [
    {
      formId: FORM_1_ID,
      themeName: "dark",
      backgroundColor: "#09090b",
      formBackgroundColor: "#18181b",
      headerBackgroundColor: "#27272a",
      primaryColor: "#a855f7",
      buttonTextColor: "#ffffff",
      textColor: "#ffffff",
      mutedTextColor: "#a1a1aa",
      borderColor: "#27272a",
      inputBackgroundColor: "#27272a",
      inputTextColor: "#ffffff",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
    },
    {
      formId: FORM_2_ID,
      themeName: "ocean",
      backgroundColor: "#f0f9ff",
      formBackgroundColor: "#ffffff",
      headerBackgroundColor: "#e0f2fe",
      primaryColor: "#0ea5e9",
      buttonTextColor: "#ffffff",
      textColor: "#0c4a6e",
      mutedTextColor: "#0284c7",
      borderColor: "#bae6fd",
      inputBackgroundColor: "#f0f9ff",
      inputTextColor: "#0c4a6e",
      bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600"
    },
    {
      formId: FORM_3_ID,
      themeName: "retro",
      backgroundColor: "#fef3c7",
      formBackgroundColor: "#fffbeb",
      headerBackgroundColor: "#fde68a",
      primaryColor: "#d97706",
      buttonTextColor: "#ffffff",
      textColor: "#78350f",
      mutedTextColor: "#b45309",
      borderColor: "#fcd34d",
      inputBackgroundColor: "#fffbeb",
      inputTextColor: "#78350f",
      bannerUrl: null
    },
    {
      formId: FORM_4_ID,
      themeName: "neon",
      backgroundColor: "#022c22",
      formBackgroundColor: "#064e3b",
      headerBackgroundColor: "#065f46",
      primaryColor: "#10b981",
      buttonTextColor: "#022c22",
      textColor: "#ecfdf5",
      mutedTextColor: "#34d399",
      borderColor: "#047857",
      inputBackgroundColor: "#022c22",
      inputTextColor: "#ecfdf5",
      bannerUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=600"
    },
    {
      formId: FORM_5_ID,
      themeName: "dark",
      backgroundColor: "#09090b",
      formBackgroundColor: "#18181b",
      headerBackgroundColor: "#27272a",
      primaryColor: "#3f3f46",
      buttonTextColor: "#ffffff",
      textColor: "#ffffff",
      mutedTextColor: "#a1a1aa",
      borderColor: "#27272a",
      inputBackgroundColor: "#27272a",
      inputTextColor: "#ffffff",
      bannerUrl: null
    },
    {
      formId: FORM_6_ID,
      themeName: "dark",
      backgroundColor: "#09090b",
      formBackgroundColor: "#18181b",
      headerBackgroundColor: "#27272a",
      primaryColor: "#3b82f6",
      buttonTextColor: "#ffffff",
      textColor: "#ffffff",
      mutedTextColor: "#a1a1aa",
      borderColor: "#27272a",
      inputBackgroundColor: "#27272a",
      inputTextColor: "#ffffff",
      bannerUrl: null
    }
  ];
  await db.insert(schema.formThemes).values(formThemeData);
  console.log(`✅ Seeded ${formThemeData.length} form themes.`);

  console.log("🌱 Seeding submissions and answer values...");
  
  // 1. Form 1 Submissions (15 entries)
  const f1Submissions = [
    { id: "s011f101-da11-4eb1-99ee-1122334455aa", submittedBy: USER_3_ID, status: "completed", createdAt: new Date("2026-01-21T10:00:00Z"), submittedAt: new Date("2026-01-21T10:00:00Z") },
    { id: "s011f102-da11-4eb1-99ee-1122334455bb", submittedBy: null, status: "completed", createdAt: new Date("2026-01-22T14:30:00Z"), submittedAt: new Date("2026-01-22T14:30:00Z") },
    { id: "s011f103-da11-4eb1-99ee-1122334455cc", submittedBy: USER_5_ID, status: "completed", createdAt: new Date("2026-02-15T09:00:00Z"), submittedAt: new Date("2026-02-15T09:00:00Z") },
    { id: "s011f104-da11-4eb1-99ee-1122334455dd", submittedBy: null, status: "completed", createdAt: new Date("2026-02-28T16:15:00Z"), submittedAt: new Date("2026-02-28T16:15:00Z") },
    { id: "s011f105-da11-4eb1-99ee-1122334455ee", submittedBy: USER_6_ID, status: "completed", createdAt: new Date("2026-03-05T11:00:00Z"), submittedAt: new Date("2026-03-05T11:00:00Z") },
    { id: "s011f106-da11-4eb1-99ee-1122334455ff", submittedBy: null, status: "completed", createdAt: new Date("2026-03-12T12:00:00Z"), submittedAt: new Date("2026-03-12T12:00:00Z") },
    { id: "s011f107-da11-4eb1-99ee-112233445501", submittedBy: null, status: "completed", createdAt: new Date("2026-03-25T15:45:00Z"), submittedAt: new Date("2026-03-25T15:45:00Z") },
    { id: "s011f108-da11-4eb1-99ee-112233445502", submittedBy: USER_7_ID, status: "completed", createdAt: new Date("2026-04-02T10:30:00Z"), submittedAt: new Date("2026-04-02T10:30:00Z") },
    { id: "s011f109-da11-4eb1-99ee-112233445503", submittedBy: null, status: "completed", createdAt: new Date("2026-04-14T09:20:00Z"), submittedAt: new Date("2026-04-14T09:20:00Z") },
    { id: "s011f110-da11-4eb1-99ee-112233445504", submittedBy: USER_8_ID, status: "completed", createdAt: new Date("2026-04-20T17:00:00Z"), submittedAt: new Date("2026-04-20T17:00:00Z") },
    { id: "s011f111-da11-4eb1-99ee-112233445505", submittedBy: null, status: "completed", createdAt: new Date("2026-05-01T11:15:00Z"), submittedAt: new Date("2026-05-01T11:15:00Z") },
    { id: "s011f112-da11-4eb1-99ee-112233445506", submittedBy: USER_9_ID, status: "completed", createdAt: new Date("2026-05-10T14:40:00Z"), submittedAt: new Date("2026-05-10T14:40:00Z") },
    { id: "s011f113-da11-4eb1-99ee-112233445507", submittedBy: null, status: "completed", createdAt: new Date("2026-05-18T13:00:00Z"), submittedAt: new Date("2026-05-18T13:00:00Z") },
    { id: "s011f114-da11-4eb1-99ee-112233445508", submittedBy: null, status: "completed", createdAt: new Date("2026-05-22T08:30:00Z"), submittedAt: new Date("2026-05-22T08:30:00Z") },
    { id: "s011f115-da11-4eb1-99ee-112233445509", submittedBy: USER_10_ID, status: "completed", createdAt: new Date("2026-05-25T16:50:00Z"), submittedAt: new Date("2026-05-25T16:50:00Z") }
  ];

  await db.insert(schema.submissions).values(
    f1Submissions.map(s => ({ ...s, formId: FORM_1_ID }))
  );

  const f1Answers = [
    // Sub 1
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_RATING, value: 5 },
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_TEXT, value: "Instant real-time form styling" },
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_TEXTAREA, value: "Need more font integrations to choose from." },
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_SELECT, value: "Daily" },
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_MULTI, value: ["Form Editor", "Theme customizer"] },
    { submissionId: f1Submissions[0].id, fieldId: FIELD_F1_CHECKBOX, value: true },

    // Sub 2
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_RATING, value: 4 },
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_TEXT, value: "Awesome developer ergonomics" },
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_TEXTAREA, value: "Add Razorpay payment integration for premium forms." },
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_SELECT, value: "Weekly" },
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_MULTI, value: ["Form Editor", "Submissions DB"] },
    { submissionId: f1Submissions[1].id, fieldId: FIELD_F1_CHECKBOX, value: false },

    // Sub 3
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_RATING, value: 2 },
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_TEXT, value: "Clean UI theme presets" },
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_TEXTAREA, value: "The loader state is slightly sluggish. Needs optimization." },
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_SELECT, value: "Rarely" },
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_MULTI, value: ["Form Editor"] },
    { submissionId: f1Submissions[2].id, fieldId: FIELD_F1_CHECKBOX, value: true },

    // Sub 4
    { submissionId: f1Submissions[3].id, fieldId: FIELD_F1_RATING, value: 5 },
    { submissionId: f1Submissions[3].id, fieldId: FIELD_F1_TEXT, value: "Speed of form creation is phenomenal!" },
    { submissionId: f1Submissions[3].id, fieldId: FIELD_F1_SELECT, value: "Daily" },
    { submissionId: f1Submissions[3].id, fieldId: FIELD_F1_MULTI, value: ["Form Editor", "Theme customizer", "Integrations"] },
    { submissionId: f1Submissions[3].id, fieldId: FIELD_F1_CHECKBOX, value: true },

    // Programmatic defaults for 5-15 to build a robust dataset
    ...f1Submissions.slice(4).flatMap((s, idx) => {
      const score = (idx % 2 === 0) ? 5 : 4;
      const freq = (idx % 3 === 0) ? "Weekly" : (idx % 3 === 1) ? "Monthly" : "Daily";
      return [
        { submissionId: s.id, fieldId: FIELD_F1_RATING, value: score },
        { submissionId: s.id, fieldId: FIELD_F1_TEXT, value: `Benefit #${idx + 5}` },
        { submissionId: s.id, fieldId: FIELD_F1_SELECT, value: freq },
        { submissionId: s.id, fieldId: FIELD_F1_CHECKBOX, value: score === 5 }
      ];
    })
  ];
  await db.insert(schema.submissionAnswers).values(f1Answers);

  // 2. Form 2 Submissions (Job Application - 6 entries)
  const f2Submissions = [
    { id: "s022f201-db22-4eb2-88ff-2233445566aa", submittedBy: USER_1_ID, status: "completed", createdAt: new Date("2026-02-12T10:00:00Z"), submittedAt: new Date("2026-02-12T10:00:00Z") },
    { id: "s022f202-db22-4eb2-88ff-2233445566bb", submittedBy: USER_3_ID, status: "completed", createdAt: new Date("2026-02-14T15:30:00Z"), submittedAt: new Date("2026-02-14T15:30:00Z") },
    { id: "s022f203-db22-4eb2-88ff-2233445566cc", submittedBy: null, status: "completed", createdAt: new Date("2026-03-01T09:00:00Z"), submittedAt: new Date("2026-03-01T09:00:00Z") },
    { id: "s022f204-db22-4eb2-88ff-2233445566dd", submittedBy: null, status: "completed", createdAt: new Date("2026-03-22T11:00:00Z"), submittedAt: new Date("2026-03-22T11:00:00Z") },
    { id: "s022f205-db22-4eb2-88ff-2233445566ee", submittedBy: null, status: "completed", createdAt: new Date("2026-04-11T16:00:00Z"), submittedAt: new Date("2026-04-11T16:00:00Z") },
    { id: "s022f206-db22-4eb2-88ff-2233445566ff", submittedBy: null, status: "completed", createdAt: new Date("2026-05-20T14:00:00Z"), submittedAt: new Date("2026-05-20T14:00:00Z") }
  ];

  await db.insert(schema.submissions).values(
    f2Submissions.map(s => ({ ...s, formId: FORM_2_ID }))
  );

  const f2Answers = [
    // Sub 1 (Aditya)
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_NAME, value: "Aditya Sharma" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_EMAIL, value: "aditya@chaiforms.com" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_PHONE, value: "+91 9999999999" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_URL, value: "https://linkedin.com/in/adityadev" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_YEARS, value: 6 },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_RESUME, value: { filename: "aditya_resume.pdf", sizeBytes: 1045231, url: "https://chaiforms-s3.s3.amazonaws.com/resumes/resume_aditya.pdf" } },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_DATE, value: "2026-06-01" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_TIME, value: "10:00" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_RADIO, value: "TypeScript" },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_MATRIX, value: { "Frontend Frameworks": "Expert", "NodeJS / Backend APIs": "Expert", "Database & SQL": "Expert", "Cloud & DevOps": "Intermediate" } },
    { submissionId: f2Submissions[0].id, fieldId: FIELD_F2_SIGNATURE, value: "Aditya Sharma (Digitally Signed)" },

    // Sub 2 (Devon)
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_NAME, value: "Devon Miller" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_EMAIL, value: "devon@chaiforms.com" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_PHONE, value: "+1 (555) 987-6543" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_URL, value: "https://linkedin.com/in/devonm" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_YEARS, value: 3 },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_RESUME, value: { filename: "devon_resume.pdf", sizeBytes: 2045612, url: "https://chaiforms-s3.s3.amazonaws.com/resumes/devon_resume.pdf" } },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_DATE, value: "2026-07-15" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_TIME, value: "14:30" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_RADIO, value: "JavaScript" },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_MATRIX, value: { "Frontend Frameworks": "Intermediate", "NodeJS / Backend APIs": "Intermediate", "Database & SQL": "Beginner", "Cloud & DevOps": "Beginner" } },
    { submissionId: f2Submissions[1].id, fieldId: FIELD_F2_SIGNATURE, value: "DM" },

    // Sub 3 (Guest Tony)
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_NAME, value: "Tony Stark" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_EMAIL, value: "tony@starkindustries.com" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_PHONE, value: "+1 (300) I-AM-IRONMAN" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_URL, value: "https://linkedin.com/in/tonystark" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_YEARS, value: 15 },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_RESUME, value: { filename: "stark_resume.pdf", sizeBytes: 450123, url: "https://chaiforms-s3.s3.amazonaws.com/resumes/tony_resume.pdf" } },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_DATE, value: "2026-05-30" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_TIME, value: "09:00" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_RADIO, value: "Rust" },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_MATRIX, value: { "Frontend Frameworks": "Expert", "NodeJS / Backend APIs": "Expert", "Database & SQL": "Expert", "Cloud & DevOps": "Expert" } },
    { submissionId: f2Submissions[2].id, fieldId: FIELD_F2_SIGNATURE, value: "TS" },

    // Dynamic defaults for 4-6
    ...f2Submissions.slice(3).flatMap((s, idx) => {
      const names = ["Emily Watson", "Frank Lucas", "Grace Hopper"];
      const code = idx % 2 === 0 ? "Rust" : "Go";
      return [
        { submissionId: s.id, fieldId: FIELD_F2_NAME, value: names[idx] },
        { submissionId: s.id, fieldId: FIELD_F2_EMAIL, value: `${names[idx].toLowerCase().replace(" ", "")}@example.com` },
        { submissionId: s.id, fieldId: FIELD_F2_YEARS, value: 4 + idx },
        { submissionId: s.id, fieldId: FIELD_F2_RESUME, value: { filename: "resume.pdf", sizeBytes: 900000, url: "https://s3.com/resume.pdf" } },
        { submissionId: s.id, fieldId: FIELD_F2_RADIO, value: code },
        { submissionId: s.id, fieldId: FIELD_F2_MATRIX, value: { "Frontend Frameworks": "Intermediate", "NodeJS / Backend APIs": "Expert", "Database & SQL": "Intermediate", "Cloud & DevOps": "Beginner" } },
        { submissionId: s.id, fieldId: FIELD_F2_SIGNATURE, value: names[idx] }
      ];
    })
  ];
  await db.insert(schema.submissionAnswers).values(f2Answers);
  console.log(`✅ Seeded ${f1Submissions.length + f2Submissions.length} submissions with answers.`);

  console.log("🌱 Seeding form comments (including nested recursive replies)...");
  const formCommentData = [
    {
      id: COMM_1_ID,
      formId: FORM_1_ID,
      userId: USER_3_ID,
      guestName: null,
      content: "Amazing job on the dark mode theme colors! It looks highly polished.",
      parentId: null,
      createdAt: new Date("2026-01-21T11:00:00Z")
    },
    {
      id: COMM_2_ID,
      formId: FORM_1_ID,
      userId: USER_1_ID, // Aditya (Owner)
      guestName: null,
      content: "Thank you, Devon! We worked really hard on curating HSL tailored templates.",
      parentId: COMM_1_ID,
      createdAt: new Date("2026-01-21T11:30:00Z")
    },
    {
      id: "d011c004-66aa-4ee2-bb11-1122334455dd",
      formId: FORM_1_ID,
      userId: USER_3_ID,
      guestName: null,
      content: "It definitely paid off. The glassmorphism card feels extremely premium.",
      parentId: COMM_2_ID,
      createdAt: new Date("2026-01-21T12:00:00Z")
    },
    {
      id: COMM_3_ID,
      formId: FORM_1_ID,
      userId: null,
      guestName: "Jane Techie",
      content: "Is there support for conditional skip logic fields yet? Loving the form editor so far!",
      parentId: null,
      createdAt: new Date("2026-03-01T15:00:00Z")
    },
    {
      id: "d011c005-66aa-4ee2-bb11-1122334455ee",
      formId: FORM_1_ID,
      userId: USER_1_ID,
      guestName: null,
      content: "Hi Jane! We are currently designing the conditions builder module. Expect it in the June release!",
      parentId: COMM_3_ID,
      createdAt: new Date("2026-03-01T16:00:00Z")
    },
    {
      id: "d022c001-77bb-4ff3-cc22-2233445566aa",
      formId: FORM_2_ID,
      userId: USER_2_ID,
      guestName: null,
      content: "We've received over 6 high-quality applications through this form already!",
      parentId: null,
      createdAt: new Date("2026-02-15T09:00:00Z")
    }
  ];
  await db.insert(schema.formComments).values(formCommentData);
  console.log(`✅ Seeded ${formCommentData.length} comments.`);

  console.log("🌱 Seeding billing orders...");
  const orderData = [
    {
      userId: USER_1_ID,
      razorpayOrderId: "order_PRX123456789",
      razorpayPaymentId: "pay_PRX123456789_complete",
      razorpaySignature: "sig_abcdef123456789",
      amount: 49900,
      currency: "INR",
      status: "completed",
      createdAt: new Date("2026-01-15T09:30:00Z")
    },
    {
      userId: USER_2_ID,
      razorpayOrderId: "order_JEN987654321",
      razorpayPaymentId: "pay_JEN987654321_complete",
      razorpaySignature: "sig_xyz987654321",
      amount: 99900,
      currency: "INR",
      status: "completed",
      createdAt: new Date("2026-02-01T11:00:00Z")
    },
    {
      userId: USER_4_ID,
      razorpayOrderId: "order_PRI112233445",
      razorpayPaymentId: null,
      razorpaySignature: null,
      amount: 49900,
      currency: "INR",
      status: "pending",
      createdAt: new Date("2026-05-25T16:00:00Z")
    },
    {
      userId: USER_3_ID,
      razorpayOrderId: "order_DEV556677889",
      razorpayPaymentId: null,
      razorpaySignature: null,
      amount: 49900,
      currency: "INR",
      status: "failed",
      createdAt: new Date("2026-05-20T10:00:00Z")
    }
  ];
  await db.insert(schema.orders).values(orderData);
  console.log(`✅ Seeded ${orderData.length} subscription orders.`);

  console.log("🌱 Seeding archived templates...");
  const archivedTemplateData = [
    { userId: USER_1_ID, formId: FORM_4_ID, createdAt: new Date("2026-03-06T10:00:00Z") },
    { userId: USER_2_ID, formId: FORM_4_ID, createdAt: new Date("2026-03-10T14:00:00Z") },
    { userId: USER_3_ID, formId: FORM_4_ID, createdAt: new Date("2026-04-01T09:00:00Z") }
  ];
  await db.insert(schema.archivedTemplates).values(archivedTemplateData);
  console.log(`✅ Seeded ${archivedTemplateData.length} template bookmarks.`);

  console.log("🌱 Seeding form views (detailed visitor geo & device distribution)...");
  const countries = ["US", "IN", "GB", "DE", "CA", "AU", "FR", "JP", "BR", "ZA"];
  const devices = ["desktop", "mobile", "tablet"];
  const formViewsData: any[] = [];

  // Generate 50 views for Form 1 (Jan - May)
  for (let i = 0; i < 50; i++) {
    const country = countries[i % countries.length];
    const device = devices[i % devices.length];
    const viewedAt = new Date(new Date("2026-01-20T00:00:00Z").getTime() + Math.random() * (new Date("2026-05-25T00:00:00Z").getTime() - new Date("2026-01-20T00:00:00Z").getTime()));
    formViewsData.push({
      formId: FORM_1_ID,
      visitorId: `visitor_f1_${i}_${Math.random().toString(36).substring(7)}`,
      country,
      device,
      viewedAt
    });
  }

  // Generate 30 views for Form 2 (Feb - May)
  for (let i = 0; i < 30; i++) {
    const country = countries[(i + 3) % countries.length];
    const device = devices[(i + 1) % devices.length];
    const viewedAt = new Date(new Date("2026-02-10T00:00:00Z").getTime() + Math.random() * (new Date("2026-05-25T00:00:00Z").getTime() - new Date("2026-02-10T00:00:00Z").getTime()));
    formViewsData.push({
      formId: FORM_2_ID,
      visitorId: `visitor_f2_${i}_${Math.random().toString(36).substring(7)}`,
      country,
      device,
      viewedAt
    });
  }
  await db.insert(schema.formViews).values(formViewsData);
  console.log(`✅ Seeded ${formViewsData.length} granular form views.`);

  console.log("🌱 Seeding form daily analytics (charts rollup data)...");
  const analyticsDailyData: any[] = [];

  // Form 1 aggregations (every 2 days)
  const baseDateF1 = new Date("2026-01-20T00:00:00Z");
  for (let day = 0; day < 30; day += 2) {
    const date = new Date(baseDateF1.getTime() + day * 24 * 60 * 60 * 1000);
    const totalViews = Math.floor(Math.random() * 20) + 5;
    const totalSubmissions = Math.floor(Math.random() * totalViews);
    const conversionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;
    analyticsDailyData.push({
      formId: FORM_1_ID,
      date,
      totalViews,
      totalSubmissions,
      conversionRate
    });
  }

  // Form 2 aggregations (every 2 days)
  const baseDateF2 = new Date("2026-02-10T00:00:00Z");
  for (let day = 0; day < 20; day += 2) {
    const date = new Date(baseDateF2.getTime() + day * 24 * 60 * 60 * 1000);
    const totalViews = Math.floor(Math.random() * 15) + 3;
    const totalSubmissions = Math.floor(Math.random() * totalViews);
    const conversionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;
    analyticsDailyData.push({
      formId: FORM_2_ID,
      date,
      totalViews,
      totalSubmissions,
      conversionRate
    });
  }
  await db.insert(schema.formAnalyticsDaily).values(analyticsDailyData);
  console.log(`✅ Seeded ${analyticsDailyData.length} daily roll-up analytics entries.`);

  console.log("\n🚀 Database Seeding complete! Happy development!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding encountered an error:", err);
  process.exit(1);
});
