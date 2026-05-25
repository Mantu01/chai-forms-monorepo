CREATE TABLE "referral_codes" (
	"code" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"background_color" varchar(50) DEFAULT '#09090b' NOT NULL,
	"form_background_color" varchar(50) DEFAULT '#18181b' NOT NULL,
	"header_background_color" varchar(50) DEFAULT '#27272a' NOT NULL,
	"primary_color" varchar(50) DEFAULT '#3f3f46' NOT NULL,
	"button_text_color" varchar(50) DEFAULT '#ffffff' NOT NULL,
	"text_color" varchar(50) DEFAULT '#ffffff' NOT NULL,
	"muted_text_color" varchar(50) DEFAULT '#a1a1aa' NOT NULL,
	"border_color" varchar(50) DEFAULT '#27272a' NOT NULL,
	"input_background_color" varchar(50) DEFAULT '#27272a' NOT NULL,
	"input_text_color" varchar(50) DEFAULT '#ffffff' NOT NULL,
	"banner_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "form_themes_form_id_unique" UNIQUE("form_id")
);
--> statement-breakpoint
CREATE TABLE "form_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_name" varchar(255),
	"content" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archived_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."field_type";--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'textarea', 'email', 'phone', 'number', 'select', 'multi_select', 'radio', 'checkbox', 'date', 'time', 'file', 'rating', 'matrix');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE "public"."field_type" USING "type"::"public"."field_type";--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "access_level" varchar(50) DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "is_template" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "form_themes" ADD CONSTRAINT "form_themes_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_comments" ADD CONSTRAINT "form_comments_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_comments" ADD CONSTRAINT "form_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_comments" ADD CONSTRAINT "form_comments_parent_id_form_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."form_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_templates" ADD CONSTRAINT "archived_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_templates" ADD CONSTRAINT "archived_templates_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;