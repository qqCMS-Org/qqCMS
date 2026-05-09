DO $$ BEGIN
  CREATE TYPE "public"."page_status" AS ENUM('draft', 'published', 'unpublished');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "navigation_items" (
	"id" text PRIMARY KEY NOT NULL,
	"label" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"href" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"language_code" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_title" text,
	"published_content" jsonb,
	CONSTRAINT "page_translations_page_lang_unique" UNIQUE("page_id","language_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"status" "page_status" DEFAULT 'draft' NOT NULL,
	"has_draft" boolean DEFAULT true NOT NULL,
	"is_homepage" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_navigation_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;