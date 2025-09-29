CREATE TABLE "study" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"time_sec" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;