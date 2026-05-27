import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";
import crypto from "crypto";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool, { schema });

const uuidFrom = (n: number) =>
  `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

// ---------------------------------------------------------------------------
// Users — unchanged from original schema; chaiuser@gmail.com is uuidFrom(1)
// ---------------------------------------------------------------------------
const usersSeed = [
  { id: uuidFrom(1),  fullName: "Chai User",     email: "chaiuser@gmail.com",   isSubscribed: true,  emailVerified: true,  googleId: "google-chaiuser", profileImageUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779538926/QGenius/avatars/u2h42qzfdhceftda8uc1.png" },
  { id: uuidFrom(2),  fullName: "Aarav Singh",   email: "aarav@chaiforms.com",  isSubscribed: true,  emailVerified: true,  googleId: "google-aarav",    profileImageUrl: null },
  { id: uuidFrom(3),  fullName: "Nisha Patel",   email: "nisha@chaiforms.com",  isSubscribed: true,  emailVerified: true,  googleId: "google-nisha",    profileImageUrl: null },
  { id: uuidFrom(4),  fullName: "Rohan Mehta",   email: "rohan@chaiforms.com",  isSubscribed: false, emailVerified: true,  googleId: null,              profileImageUrl: null },
  { id: uuidFrom(5),  fullName: "Mia Das",       email: "mia@chaiforms.com",    isSubscribed: true,  emailVerified: true,  googleId: "google-mia",      profileImageUrl: null },
  { id: uuidFrom(6),  fullName: "Ishaan Kapoor", email: "ishaan@chaiforms.com", isSubscribed: false, emailVerified: false, googleId: null,              profileImageUrl: null },
  { id: uuidFrom(7),  fullName: "Zoya Khan",     email: "zoya@chaiforms.com",   isSubscribed: true,  emailVerified: true,  googleId: "google-zoya",     profileImageUrl: null },
  { id: uuidFrom(8),  fullName: "Rahul Verma",   email: "rahul@chaiforms.com",  isSubscribed: false, emailVerified: true,  googleId: null,              profileImageUrl: null },
  { id: uuidFrom(9),  fullName: "Ananya Iyer",   email: "ananya@chaiforms.com", isSubscribed: true,  emailVerified: true,  googleId: "google-ananya",   profileImageUrl: null },
  { id: uuidFrom(10), fullName: "Kabir Nair",    email: "kabir@chaiforms.com",  isSubscribed: false, emailVerified: true,  googleId: null,              profileImageUrl: null },
  { id: uuidFrom(11), fullName: "Simran Kaur",   email: "simran@chaiforms.com", isSubscribed: true,  emailVerified: true,  googleId: "google-simran",   profileImageUrl: null },
  { id: uuidFrom(12), fullName: "Vivek Rao",     email: "vivek@chaiforms.com",  isSubscribed: false, emailVerified: false, googleId: null,              profileImageUrl: null },
];

// ---------------------------------------------------------------------------
// Stable IDs
// ---------------------------------------------------------------------------
const workspaceIds = {
  main:      uuidFrom(101),
  growth:    uuidFrom(102),
  product:   uuidFrom(103),
  community: uuidFrom(104),
  hiring:    uuidFrom(105),
};

const formIds = {
  allFields:  uuidFrom(201),
  nps:        uuidFrom(202),
  event:      uuidFrom(203),
  template:   uuidFrom(204),
  archived:   uuidFrom(205),
  hiring:     uuidFrom(206),
  onboarding: uuidFrom(207),
};

// ---------------------------------------------------------------------------
// Date helpers — everything within May 12–27 2026
// ---------------------------------------------------------------------------
const d = (month: number, day: number, hour = 0, min = 0) =>
  new Date(2026, month - 1, day, hour, min);

async function main() {
  console.log("Cleaning existing records...");
  await db.delete(schema.submissionAnswers);
  await db.delete(schema.submissions);
  await db.delete(schema.formComments);
  await db.delete(schema.formThemes);
  await db.delete(schema.archivedTemplates);
  await db.delete(schema.formFields);
  await db.delete(schema.formPages);
  await db.delete(schema.forms);
  await db.delete(schema.workspaceInvites);
  await db.delete(schema.workspaceMembers);
  await db.delete(schema.workspaces);
  await db.delete(schema.orders);
  await db.delete(schema.defaultThemes);
  await db.delete(schema.users);
  await db.delete(schema.referralCodes);

  // -------------------------------------------------------------------------
  // Referral codes
  // -------------------------------------------------------------------------
  await db.insert(schema.referralCodes).values([
    { code: "CHAI50"      },
    { code: "POWERUSER25" },
    { code: "TEAMUP30"    },
    { code: "EARLY100"    },
    { code: "FESTIVE20"   },
  ]);

  // -------------------------------------------------------------------------
  // Users — accounts created May 12–13; last updated May 25–27
  // chaiuser (id=1) is the earliest, everyone else onboarded after
  // -------------------------------------------------------------------------
  await db.insert(schema.users).values(
    usersSeed.map((u, i) => ({
      ...u,
      passwordHash: hashPassword("Chai@123"),
      createdAt:   d(5, 12 + Math.min(i, 3)),           // May 12–15
      updatedAt:   d(5, 24 + Math.min(i % 4, 3)),       // May 24–27
    })),
  );

  // -------------------------------------------------------------------------
  // Workspaces — all created by chaiuser (1) or co-founders, May 12–14
  // -------------------------------------------------------------------------
  await db.insert(schema.workspaces).values([
    { id: workspaceIds.main,      name: "Chai Forms HQ",      slug: "chai-forms-hq",      logoUrl: null, createdBy: uuidFrom(1), createdAt: d(5, 12) },
    { id: workspaceIds.growth,    name: "Chai Growth Ops",    slug: "chai-growth-ops",    logoUrl: null, createdBy: uuidFrom(1), createdAt: d(5, 13) },
    { id: workspaceIds.product,   name: "Chai Product Lab",   slug: "chai-product-lab",   logoUrl: null, createdBy: uuidFrom(1), createdAt: d(5, 13) },
    { id: workspaceIds.community, name: "Community Programs", slug: "community-programs", logoUrl: null, createdBy: uuidFrom(3), createdAt: d(5, 14) },
    { id: workspaceIds.hiring,    name: "Talent Pipeline",    slug: "talent-pipeline",    logoUrl: null, createdBy: uuidFrom(2), createdAt: d(5, 14) },
  ]);

  // -------------------------------------------------------------------------
  // Workspace members — joined May 12–16
  // -------------------------------------------------------------------------
  await db.insert(schema.workspaceMembers).values([
    // HQ
    { workspaceId: workspaceIds.main, userId: uuidFrom(1), name: "Chai User",    role: "owner",  joinedAt: d(5, 12) },
    { workspaceId: workspaceIds.main, userId: uuidFrom(2), name: "Aarav Singh",  role: "admin",  joinedAt: d(5, 12) },
    { workspaceId: workspaceIds.main, userId: uuidFrom(3), name: "Nisha Patel",  role: "member", joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.main, userId: uuidFrom(4), name: "Rohan Mehta",  role: "member", joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.main, userId: uuidFrom(7), name: "Zoya Khan",    role: "member", joinedAt: d(5, 14) },

    // Growth
    { workspaceId: workspaceIds.growth, userId: uuidFrom(1), name: "Chai User",     role: "owner",  joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.growth, userId: uuidFrom(5), name: "Mia Das",       role: "admin",  joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.growth, userId: uuidFrom(6), name: "Ishaan Kapoor", role: "member", joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.growth, userId: uuidFrom(3), name: "Nisha Patel",   role: "member", joinedAt: d(5, 14) },

    // Product
    { workspaceId: workspaceIds.product, userId: uuidFrom(1), name: "Chai User",   role: "owner",  joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.product, userId: uuidFrom(8), name: "Rahul Verma", role: "admin",  joinedAt: d(5, 13) },
    { workspaceId: workspaceIds.product, userId: uuidFrom(9), name: "Ananya Iyer", role: "member", joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.product, userId: uuidFrom(2), name: "Aarav Singh", role: "member", joinedAt: d(5, 15) },

    // Community
    { workspaceId: workspaceIds.community, userId: uuidFrom(3),  name: "Nisha Patel",  role: "owner",  joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.community, userId: uuidFrom(1),  name: "Chai User",    role: "admin",  joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.community, userId: uuidFrom(10), name: "Kabir Nair",   role: "member", joinedAt: d(5, 15) },
    { workspaceId: workspaceIds.community, userId: uuidFrom(11), name: "Simran Kaur",  role: "member", joinedAt: d(5, 15) },

    // Hiring
    { workspaceId: workspaceIds.hiring, userId: uuidFrom(2),  name: "Aarav Singh", role: "owner",  joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.hiring, userId: uuidFrom(1),  name: "Chai User",   role: "admin",  joinedAt: d(5, 14) },
    { workspaceId: workspaceIds.hiring, userId: uuidFrom(12), name: "Vivek Rao",   role: "member", joinedAt: d(5, 15) },
    { workspaceId: workspaceIds.hiring, userId: uuidFrom(4),  name: "Rohan Mehta", role: "member", joinedAt: d(5, 16) },
  ]);

  // -------------------------------------------------------------------------
  // Workspace invites — sent May 17–22, some accepted by May 24–26
  // -------------------------------------------------------------------------
  await db.insert(schema.workspaceInvites).values([
    { workspaceId: workspaceIds.main,      email: "future-admin@chai.dev",      role: "admin",  token: "invite-main-admin",       expiresAt: d(6, 17),      createdAt: d(5, 17) },
    { workspaceId: workspaceIds.main,      email: "guest-analyst@chai.dev",     role: "member", token: "invite-main-member",      expiresAt: d(6, 17), acceptedAt: d(5, 24), createdAt: d(5, 17) },
    { workspaceId: workspaceIds.growth,    email: "campaign-lead@chai.dev",     role: "member", token: "invite-growth-member",    expiresAt: d(6, 20),      createdAt: d(5, 20) },
    { workspaceId: workspaceIds.product,   email: "design-reviewer@chai.dev",   role: "member", token: "invite-product-member",   expiresAt: d(6, 22), acceptedAt: d(5, 26), createdAt: d(5, 22) },
    { workspaceId: workspaceIds.community, email: "partner-community@chai.dev", role: "admin",  token: "invite-community-admin",  expiresAt: d(6, 22),      createdAt: d(5, 22) },
  ]);

  // -------------------------------------------------------------------------
  // Default themes
  // -------------------------------------------------------------------------
  await db.insert(schema.defaultThemes).values([
  {id:uuidFrom(301), name: "cyberpunk",  backgroundColor: "#0d0010", formBackgroundColor: "#1a0020", headerBackgroundColor: "#2a0035", primaryColor: "#ff2d78", buttonTextColor: "#ffffff", textColor: "#ffe0f0", mutedTextColor: "#cc80aa", borderColor: "#ff2d78", inputBackgroundColor: "#1f0028", inputTextColor: "#ffe0f0", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883442/c644aa11382fdd66e42fdbdb1a65aeab_kazdkm.jpg", isDefault: true },
  {id:uuidFrom(302), name: "education",  backgroundColor: "#0f1a14", formBackgroundColor: "#f0f4f1", headerBackgroundColor: "#ddeae2", primaryColor: "#1a7a4a", buttonTextColor: "#ffffff", textColor: "#0f1a14", mutedTextColor: "#3a5244", borderColor: "#1a7a4a", inputBackgroundColor: "#e8f0eb", inputTextColor: "#0f1a14", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883442/d90d921f859121ca4b277e3f3787ac76_gq7xj6.jpg", isDefault: true },
  {id:uuidFrom(303), name: "sports",     backgroundColor: "#0a0a06", formBackgroundColor: "#fffbf5", headerBackgroundColor: "#fff3e0", primaryColor: "#f97316", buttonTextColor: "#1a1a0a", textColor: "#1a1a0a", mutedTextColor: "#4a4a2a", borderColor: "#f97316", inputBackgroundColor: "#fff8ee", inputTextColor: "#1a1a0a", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/ae3342120b26ae1fe321545250a1b00e_x0zvfp.jpg", isDefault: true },
  {id:uuidFrom(304), name: "anime",      backgroundColor: "#1a0008", formBackgroundColor: "#1e0010", headerBackgroundColor: "#2e0018", primaryColor: "#e8192c", buttonTextColor: "#ffffff", textColor: "#ffe8ec", mutedTextColor: "#cc8899", borderColor: "#e8192c", inputBackgroundColor: "#260010", inputTextColor: "#ffe8ec", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883442/cc70f0027a0a4da401461b33044b7827_lhn9iu.jpg", isDefault: true },
  {id:uuidFrom(305), name: "cinematic",  backgroundColor: "#0c0c0a", formBackgroundColor: "#1a1a16", headerBackgroundColor: "#222220", primaryColor: "#b5a16a", buttonTextColor: "#0c0c0a", textColor: "#e8e0cc", mutedTextColor: "#9a9080", borderColor: "#b5a16a", inputBackgroundColor: "#141410", inputTextColor: "#e8e0cc", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/87457141110db7a11dcb7469dc31bb9f_eoxuqz.jpg", isDefault: true },
  {id:uuidFrom(306), name: "nature",     backgroundColor: "#071810", formBackgroundColor: "#e8f5ee", headerBackgroundColor: "#d4ecdf", primaryColor: "#2e9e6e", buttonTextColor: "#ffffff", textColor: "#0d2818", mutedTextColor: "#2a5040", borderColor: "#2e9e6e", inputBackgroundColor: "#ddf0e8", inputTextColor: "#0d2818", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/a2fa3bd37373e18b7142e85c91ecabf3_tuvmla.jpg", isDefault: true },
  {id:uuidFrom(307), name: "tech",       backgroundColor: "#030b1a", formBackgroundColor: "#060f24", headerBackgroundColor: "#0a1530", primaryColor: "#2563eb", buttonTextColor: "#ffffff", textColor: "#e0ecff", mutedTextColor: "#7a9acc", borderColor: "#2563eb", inputBackgroundColor: "#08122e", inputTextColor: "#e0ecff", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/0448c54f68583fb0e4e0fd3d08523daf_obnmmr.jpg", isDefault: true },
  {id:uuidFrom(308), name: "startup",    backgroundColor: "#010f14", formBackgroundColor: "#021820", headerBackgroundColor: "#032530", primaryColor: "#06b6d4", buttonTextColor: "#010f14", textColor: "#e0faff", mutedTextColor: "#60b8cc", borderColor: "#06b6d4", inputBackgroundColor: "#031c24", inputTextColor: "#e0faff", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/bbf78f8921ac3a68ae6574f64da9b140_dvhnem.jpg", isDefault: true },
  {id:uuidFrom(309), name: "game",       backgroundColor: "#020816", formBackgroundColor: "#060e28", headerBackgroundColor: "#0a1438", primaryColor: "#1d4ed8", buttonTextColor: "#ffffff", textColor: "#dceeff", mutedTextColor: "#6899cc", borderColor: "#1d4ed8", inputBackgroundColor: "#040c1e", inputTextColor: "#dceeff", bannerUrl: "https://res.cloudinary.com/dqznmhhtv/image/upload/v1779883441/20a706a18514c33b9e643641e8cbe25a_aaj36c.jpg", isDefault: true },
]);

  // -------------------------------------------------------------------------
  // Forms — created May 13–17; published May 14–19
  // chaiuser created 5 of 7; Nisha owns event; Aarav owns hiring
  // -------------------------------------------------------------------------
  await db.insert(schema.forms).values([
    {
      id: formIds.allFields, workspaceId: workspaceIds.main,
      title: "All Fields Demo Form", description: "Shows every field type in one place.",
      slug: "all-fields-demo-form", status: "published", isPublic: true, accessLevel: "public",
      createdBy: uuidFrom(1), allowMultipleSubmissions: true, requireAuth: false,
      maxSubmissions: 500, redirectUrl: "https://chai.dev/thanks",
      themeConfig: { preset: "dark-pro" }, isTemplate: false,
      publishedAt: d(5, 14), createdAt: d(5, 13),
    },
    {
      id: formIds.nps, workspaceId: workspaceIds.growth,
      title: "NPS Tracker – May 2026", description: "NPS and retention feedback for Q2 close.",
      slug: "nps-tracker-may-2026", status: "published", isPublic: true, accessLevel: "public",
      createdBy: uuidFrom(1), allowMultipleSubmissions: false, requireAuth: false,
      maxSubmissions: 1000, redirectUrl: null,
      themeConfig: { preset: "ocean-breeze" }, isTemplate: false,
      publishedAt: d(5, 15), createdAt: d(5, 14),
    },
    {
      id: formIds.event, workspaceId: workspaceIds.community,
      title: "Community Meetup RSVP – June", description: "Monthly community meetup RSVP for June 2026.",
      slug: "community-meetup-rsvp-june", status: "published", isPublic: true, accessLevel: "public",
      createdBy: uuidFrom(3), allowMultipleSubmissions: true, requireAuth: true,
      maxSubmissions: 300, redirectUrl: null,
      themeConfig: { preset: "mint" }, isTemplate: false,
      publishedAt: d(5, 16), createdAt: d(5, 15),
    },
    {
      id: formIds.template, workspaceId: workspaceIds.product,
      title: "Feature Request Template", description: "Reusable template for collecting product feature ideas.",
      slug: "feature-request-template", status: "published", isPublic: true, accessLevel: "public",
      createdBy: uuidFrom(1), allowMultipleSubmissions: true, requireAuth: false,
      maxSubmissions: null, redirectUrl: null,
      themeConfig: { preset: "sunset" }, isTemplate: true,
      publishedAt: d(5, 16), createdAt: d(5, 15),
    },
    {
      id: formIds.archived, workspaceId: workspaceIds.main,
      title: "Legacy Contact Intake", description: "Archived intake form — superseded by All Fields Demo.",
      slug: "legacy-contact-intake", status: "archived", isPublic: false, accessLevel: "restricted",
      createdBy: uuidFrom(1), allowMultipleSubmissions: false, requireAuth: false,
      maxSubmissions: 50, redirectUrl: null,
      themeConfig: { preset: "dark-pro" }, isTemplate: false,
      closeAt: d(5, 20), createdAt: d(5, 13),
    },
    {
      id: formIds.hiring, workspaceId: workspaceIds.hiring,
      title: "Senior Engineer Application", description: "Application form for the May 2026 senior engineer opening.",
      slug: "senior-engineer-application", status: "published", isPublic: true, accessLevel: "public",
      createdBy: uuidFrom(2), allowMultipleSubmissions: true, requireAuth: false,
      maxSubmissions: 400, redirectUrl: null,
      themeConfig: { preset: "ocean-breeze" }, isTemplate: false,
      publishedAt: d(5, 17), createdAt: d(5, 16),
    },
    {
      id: formIds.onboarding, workspaceId: workspaceIds.main,
      title: "Internal Onboarding Checklist", description: "Employee onboarding form — currently in draft.",
      slug: "internal-onboarding-checklist", status: "draft", isPublic: false, accessLevel: "private",
      createdBy: uuidFrom(1), allowMultipleSubmissions: true, requireAuth: true,
      maxSubmissions: null, redirectUrl: null,
      themeConfig: { preset: "dark-pro" }, isTemplate: false,
      createdAt: d(5, 17),
    },
  ]);

  // -------------------------------------------------------------------------
  // Form pages
  // -------------------------------------------------------------------------
  const pages: any[] = [
    { id: uuidFrom(401), formId: formIds.allFields, title: "Primary Details",  description: "General details",    order: 1 },
    { id: uuidFrom(402), formId: formIds.allFields, title: "Advanced Inputs",  description: "Structured answers", order: 2 },
  ];
  
  let pageCounter = 403;
  const otherFormIds = [formIds.nps, formIds.event, formIds.template, formIds.archived, formIds.hiring, formIds.onboarding];
  for (const fId of otherFormIds) {
    pages.push({ id: uuidFrom(pageCounter++), formId: fId, title: "Page 1", description: "First page", order: 1 });
    pages.push({ id: uuidFrom(pageCounter++), formId: fId, title: "Page 2", description: "Second page", order: 2 });
    pages.push({ id: uuidFrom(pageCounter++), formId: fId, title: "Page 3", description: "Third page", order: 3 });
  }
  await db.insert(schema.formPages).values(pages);

  const allFieldsPage1 = pages[0]!.id;
  const allFieldsPage2 = pages[1]!.id;

  // -------------------------------------------------------------------------
  // Form fields
  // -------------------------------------------------------------------------
  const fieldIds = {
    text:      uuidFrom(501),
    textarea:  uuidFrom(502),
    email:     uuidFrom(503),
    phone:     uuidFrom(504),
    number:    uuidFrom(505),
    select:    uuidFrom(506),
    multi:     uuidFrom(507),
    radio:     uuidFrom(508),
    checkbox:  uuidFrom(509),
    date:      uuidFrom(510),
    time:      uuidFrom(511),
    file:      uuidFrom(512),
    rating:    uuidFrom(513),
    matrix:    uuidFrom(514),
    signature: uuidFrom(515),
    url:       uuidFrom(516),
  };

  const fields: any[] = [
    // Page 1 — primary details
    { id: fieldIds.text,      formId: formIds.allFields, pageId: allFieldsPage1, label: "Full Name",            type: "text",         fieldKey: "full_name",      isRequired: true,  order: 1 },
    { id: fieldIds.textarea,  formId: formIds.allFields, pageId: allFieldsPage1, label: "Bio",                  type: "textarea",     fieldKey: "bio",            isRequired: false, order: 2 },
    { id: fieldIds.email,     formId: formIds.allFields, pageId: allFieldsPage1, label: "Email",                type: "email",        fieldKey: "email",          isRequired: true,  order: 3 },
    { id: fieldIds.phone,     formId: formIds.allFields, pageId: allFieldsPage1, label: "Phone",                type: "phone",        fieldKey: "phone",          isRequired: false, order: 4 },
    { id: fieldIds.url,       formId: formIds.allFields, pageId: allFieldsPage1, label: "Portfolio URL",        type: "url",          fieldKey: "portfolio_url",  isRequired: false, order: 5 },

    // Page 2 — advanced inputs
    { id: fieldIds.number,    formId: formIds.allFields, pageId: allFieldsPage2, label: "Years of Experience",  type: "number",       fieldKey: "years_experience", isRequired: true,  order: 1,  config: { min: 0, max: 25 } },
    { id: fieldIds.select,    formId: formIds.allFields, pageId: allFieldsPage2, label: "Department",           type: "select",       fieldKey: "department",       isRequired: true,  order: 2,  config: { options: ["Engineering", "Growth", "Support"] } },
    { id: fieldIds.multi,     formId: formIds.allFields, pageId: allFieldsPage2, label: "Preferred Tools",      type: "multi_select", fieldKey: "tools",            isRequired: false, order: 3,  config: { options: ["Notion", "Linear", "Slack", "Figma"] } },
    { id: fieldIds.radio,     formId: formIds.allFields, pageId: allFieldsPage2, label: "Work Mode",            type: "radio",        fieldKey: "work_mode",        isRequired: true,  order: 4,  config: { options: ["Remote", "Hybrid", "Onsite"] } },
    { id: fieldIds.checkbox,  formId: formIds.allFields, pageId: allFieldsPage2, label: "Agree to terms",       type: "checkbox",     fieldKey: "agree",            defaultValue: "true", isRequired: true, order: 5 },
    { id: fieldIds.date,      formId: formIds.allFields, pageId: allFieldsPage2, label: "Join Date",            type: "date",         fieldKey: "join_date",        isRequired: false, order: 6 },
    { id: fieldIds.time,      formId: formIds.allFields, pageId: allFieldsPage2, label: "Preferred Meeting Time", type: "time",       fieldKey: "meeting_time",     isRequired: false, order: 7 },
    { id: fieldIds.file,      formId: formIds.allFields, pageId: allFieldsPage2, label: "Resume",               type: "file",         fieldKey: "resume",           isRequired: false, order: 8,  config: { allowedExtensions: [".pdf"], maxSizeBytes: 4000000 } },
    { id: fieldIds.rating,    formId: formIds.allFields, pageId: allFieldsPage2, label: "Rate Experience",      type: "rating",       fieldKey: "rating",           isRequired: true,  order: 9,  config: { maxStars: 5 } },
    { id: fieldIds.matrix,    formId: formIds.allFields, pageId: allFieldsPage2, label: "Skill Matrix",         type: "matrix",       fieldKey: "skill_matrix",     isRequired: false, order: 10, config: { rows: ["Frontend", "Backend", "DevOps"], columns: ["Beginner", "Intermediate", "Expert"] } },
    { id: fieldIds.signature, formId: formIds.allFields, pageId: allFieldsPage2, label: "Signature",            type: "signature",    fieldKey: "signature",        isRequired: true,  order: 11 },
  ];

  let fieldCounter = 517;
  for (let i = 2; i < pages.length; i++) {
    const page = pages[i];
    fields.push({ id: uuidFrom(fieldCounter++), formId: page.formId, pageId: page.id, label: `Text Field - ${page.title}`, type: "text", fieldKey: `text_${fieldCounter}`, isRequired: true, order: 1 });
    fields.push({ id: uuidFrom(fieldCounter++), formId: page.formId, pageId: page.id, label: `Textarea - ${page.title}`, type: "textarea", fieldKey: `textarea_${fieldCounter}`, isRequired: false, order: 2 });
    fields.push({ id: uuidFrom(fieldCounter++), formId: page.formId, pageId: page.id, label: `Email - ${page.title}`, type: "email", fieldKey: `email_${fieldCounter}`, isRequired: true, order: 3 });
    fields.push({ id: uuidFrom(fieldCounter++), formId: page.formId, pageId: page.id, label: `Select - ${page.title}`, type: "select", fieldKey: `select_${fieldCounter}`, isRequired: true, order: 4, config: { options: ["Option A", "Option B", "Option C"] } });
    fields.push({ id: uuidFrom(fieldCounter++), formId: page.formId, pageId: page.id, label: `Rating - ${page.title}`, type: "rating", fieldKey: `rating_${fieldCounter}`, isRequired: false, order: 5, config: { maxStars: 5 } });
  }

  await db.insert(schema.formFields).values(fields as any);

  // -------------------------------------------------------------------------
  // Form themes
  // -------------------------------------------------------------------------
  await db.insert(schema.formThemes).values([
    { formId: formIds.allFields,  themeName: "dark-pro",     defaultThemeId: uuidFrom(301), primaryColor: "#7c3aed" },
    { formId: formIds.nps,        themeName: "ocean-breeze", defaultThemeId: uuidFrom(302), primaryColor: "#0284c7" },
    { formId: formIds.event,      themeName: "mint",         defaultThemeId: uuidFrom(304), primaryColor: "#10b981" },
    { formId: formIds.template,   themeName: "sunset",       defaultThemeId: uuidFrom(303), primaryColor: "#f97316" },
    { formId: formIds.archived,   themeName: "dark-pro",     defaultThemeId: uuidFrom(301), primaryColor: "#7c3aed" },
    { formId: formIds.hiring,     themeName: "ocean-breeze", defaultThemeId: uuidFrom(302), primaryColor: "#0284c7" },
    { formId: formIds.onboarding, themeName: "dark-pro",     defaultThemeId: uuidFrom(301), primaryColor: "#7c3aed" },
  ]);

  // -------------------------------------------------------------------------
  // Submissions
  // -------------------------------------------------------------------------
  const submissions: any[] = [];
  const answers: any[] = [];
  let subCounter = 700;
  
  const formsToSeed = Object.values(formIds);
  
  for (let fIndex = 0; fIndex < formsToSeed.length; fIndex++) {
    const formId = formsToSeed[fIndex]!;
    const numSubs = Math.floor(Math.random() * 100) + 20; // Random number between 120 and 20
    const formFields = fields.filter(f => f.formId === formId);
    
    for (let i = 0; i < numSubs; i++) {
      const subId = uuidFrom(subCounter++);
      const date = d(5, 14 + (i % 13), 9 + (i % 8), i % 60);
      
      let submittedBy = null;
      if (i % 7 === 0) submittedBy = uuidFrom(1);
      if (i % 11 === 0) submittedBy = uuidFrom(2);

      submissions.push({
        id: subId,
        formId,
        submittedBy,
        status: "completed",
        submittedAt: date,
        createdAt: date,
      });

      // Answers
      for (const field of formFields) {
        let value: any = `Answer ${i} for ${field.label}`;
        if (field.type === "email") value = `user${i}@mail.com`;
        if (field.type === "select") value = field.config?.options?.[i % (field.config?.options?.length || 1)] || "Option A";
        if (field.type === "rating") value = (i % 5) + 1;
        if (field.type === "number") value = i;
        if (field.type === "phone") value = `+91-900001${(100 + i).toString()}`;
        if (field.type === "checkbox") value = i % 2 === 0;
        if (field.type === "radio") value = field.config?.options?.[i % (field.config?.options?.length || 1)] || "Option A";
        if (field.type === "multi_select") value = [field.config?.options?.[i % (field.config?.options?.length || 1)] || "Option A"];
        if (field.type === "date") value = "2026-06-16";
        if (field.type === "time") value = "10:00";
        if (field.type === "file") value = { filename: `file_${i}.pdf`, sizeBytes: 1200000, url: `https://cdn.chai.dev/file_${i}.pdf` };
        if (field.type === "matrix") value = { [field.config?.rows?.[0] || "R1"]: field.config?.columns?.[0] || "C1" };
        if (field.type === "signature") value = `Signature ${i}`;
        if (field.type === "url") value = `https://example.com/user${i}`;

        answers.push({
          submissionId: subId,
          fieldId: field.id,
          value,
        });
      }
    }
  }

  // Insert submissions in batches
  const subChunkSize = 2000;
  for (let i = 0; i < submissions.length; i += subChunkSize) {
    await db.insert(schema.submissions).values(submissions.slice(i, i + subChunkSize));
  }
  
  // Insert answers in batches
  const chunkAnsSize = 2000;
  for (let i = 0; i < answers.length; i += chunkAnsSize) {
    await db.insert(schema.submissionAnswers).values(answers.slice(i, i + chunkAnsSize));
  }

  // -------------------------------------------------------------------------
  // Form comments — May 18–26; chaiuser (1) is the most active commenter
  // -------------------------------------------------------------------------
  const c1 = uuidFrom(801);
  const c2 = uuidFrom(802);
  await db.insert(schema.formComments).values([
    // All Fields Demo thread
    { id: c1,           formId: formIds.allFields, userId: uuidFrom(2), content: "The demo form is super useful for onboarding new teammates — covers every field type.",                     createdAt: d(5, 18, 10, 0) },
    { id: c2,           formId: formIds.allFields, userId: uuidFrom(1), content: "Agreed! I added a matrix and signature field specifically for the QA walkthrough.", parentId: c1,          createdAt: d(5, 18, 10, 45) },
    { id: uuidFrom(803), formId: formIds.allFields, userId: null, guestName: "Guest Reviewer", content: "Could we add conditional logic per field? Would make it even more powerful.",          createdAt: d(5, 19, 9, 0) },
    { id: uuidFrom(806), formId: formIds.allFields, userId: uuidFrom(1), content: "Good call — conditional logic is on the roadmap for Q3.",  parentId: uuidFrom(803),                       createdAt: d(5, 19, 11, 30) },

    // Feature Request Template thread
    { id: uuidFrom(804), formId: formIds.template, userId: uuidFrom(3), content: "Template usage jumped 40% this week — teams love having a starting point.",                                 createdAt: d(5, 21, 9, 0) },
    { id: uuidFrom(807), formId: formIds.template, userId: uuidFrom(1), content: "Great signal. Will pin this template to the product workspace for easier discovery.",                       createdAt: d(5, 21, 10, 15) },

    // Senior Engineer hiring form thread
    { id: uuidFrom(805), formId: formIds.hiring, userId: uuidFrom(1),   content: "We've already received 14 strong applications in the first week — pipeline looks healthy.",               createdAt: d(5, 23, 9, 30) },
    { id: uuidFrom(808), formId: formIds.hiring, userId: uuidFrom(2),   content: "Agreed. Shortlisting starts Friday — I'll share the filtered view with the hiring panel.",                createdAt: d(5, 23, 11, 0) },
    { id: uuidFrom(809), formId: formIds.hiring, userId: uuidFrom(1),   content: "Sounds good. Let me know if you need me to adjust any field weights before the review.",                  createdAt: d(5, 23, 12, 0) },

    // NPS Tracker comment
    { id: uuidFrom(810), formId: formIds.nps, userId: uuidFrom(5),      content: "Early NPS responses are trending at 8.4 — best score we've had this quarter.",                           createdAt: d(5, 25, 10, 0) },
    { id: uuidFrom(811), formId: formIds.nps, userId: uuidFrom(1),      content: "Excellent! Let's make sure Mia highlights this in the Q2 growth sync tomorrow.",                          createdAt: d(5, 25, 11, 30) },
  ]);

  // -------------------------------------------------------------------------
  // Orders — chaiuser is the primary paying customer (2 orders)
  // Others have one each; dates spread May 12–26
  // -------------------------------------------------------------------------
  await db.insert(schema.orders).values([
    // chaiuser — completed subscription on account creation day
    { userId: uuidFrom(1), razorpayOrderId: "order_chai_001",  razorpayPaymentId: "pay_chai_001",  razorpaySignature: "sig_chai_001",  amount: 99900,  currency: "INR", status: "completed", createdAt: d(5, 12) },
    // chaiuser — upgrade attempt still pending
    { userId: uuidFrom(1), razorpayOrderId: "order_chai_002",  razorpayPaymentId: null,             razorpaySignature: null,             amount: 49900,  currency: "INR", status: "pending",   createdAt: d(5, 26) },
    // Aarav — completed
    { userId: uuidFrom(2), razorpayOrderId: "order_aarav_001", razorpayPaymentId: "pay_aarav_001", razorpaySignature: "sig_aarav_001", amount: 49900,  currency: "INR", status: "completed", createdAt: d(5, 13) },
    // Nisha — payment failed
    { userId: uuidFrom(3), razorpayOrderId: "order_nisha_001", razorpayPaymentId: null,             razorpaySignature: null,             amount: 49900,  currency: "INR", status: "failed",    createdAt: d(5, 14) },
    // Mia — annual plan completed
    { userId: uuidFrom(5), razorpayOrderId: "order_mia_001",   razorpayPaymentId: "pay_mia_001",   razorpaySignature: "sig_mia_001",   amount: 199900, currency: "INR", status: "completed", createdAt: d(5, 16) },
  ]);

  // -------------------------------------------------------------------------
  // Archived templates — chaiuser saved the template first, others followed
  // -------------------------------------------------------------------------
  await db.insert(schema.archivedTemplates).values([
    { userId: uuidFrom(1), formId: formIds.template, createdAt: d(5, 17) },
    { userId: uuidFrom(2), formId: formIds.template, createdAt: d(5, 18) },
    { userId: uuidFrom(3), formId: formIds.template, createdAt: d(5, 20) },
    { userId: uuidFrom(9), formId: formIds.template, createdAt: d(5, 22) },
  ]);

  console.log("Seed complete.");
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Seeding error:", err);
  await pool.end();
  process.exit(1);
});