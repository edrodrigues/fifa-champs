CREATE TYPE "public"."championship_status" AS ENUM('draft', 'groups', 'knockout', 'completed');--> statement-breakpoint
CREATE TYPE "public"."match_phase" AS ENUM('group', 'quarterfinal', 'semifinal', 'third_place', 'final');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('active', 'eliminated', 'winner', 'runner_up', 'third_place');--> statement-breakpoint
CREATE TABLE "championships" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "championship_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"championship_id" integer NOT NULL,
	"phase" "match_phase" NOT NULL,
	"group_letter" text,
	"round" integer,
	"bracket_position" integer,
	"player_home_id" integer,
	"player_away_id" integer,
	"score_home" integer,
	"score_away" integer,
	"status" "match_status" DEFAULT 'pending' NOT NULL,
	"winner_id" integer,
	"loser_id" integer,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"championship_id" integer NOT NULL,
	"name" text NOT NULL,
	"group_letter" text,
	"group_position" integer,
	"status" "participant_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_home_id_participants_id_fk" FOREIGN KEY ("player_home_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_away_id_participants_id_fk" FOREIGN KEY ("player_away_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_participants_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_loser_id_participants_id_fk" FOREIGN KEY ("loser_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE cascade ON UPDATE no action;