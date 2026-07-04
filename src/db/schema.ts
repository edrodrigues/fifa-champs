import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const championshipStatusEnum = pgEnum("championship_status", ["draft", "groups", "knockout", "completed"]);
export const participantStatusEnum = pgEnum("participant_status", ["active", "eliminated", "winner", "runner_up", "third_place"]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "completed"]);
export const matchPhaseEnum = pgEnum("match_phase", ["group", "round_of_16", "quarterfinal", "semifinal", "third_place", "final"]);

export const championships = pgTable("championships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: championshipStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  championship_id: integer("championship_id").notNull().references(() => championships.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  group_letter: text("group_letter"),
  group_position: integer("group_position"),
  status: participantStatusEnum("status").notNull().default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  championship_id: integer("championship_id").notNull().references(() => championships.id, { onDelete: "cascade" }),
  phase: matchPhaseEnum("phase").notNull(),
  group_letter: text("group_letter"),
  round: integer("round"),
  bracket_position: integer("bracket_position"),
  player_home_id: integer("player_home_id").references(() => participants.id, { onDelete: "set null" }),
  player_away_id: integer("player_away_id").references(() => participants.id, { onDelete: "set null" }),
  score_home: integer("score_home"),
  score_away: integer("score_away"),
  score_home_penalty: integer("score_home_penalty"),
  score_away_penalty: integer("score_away_penalty"),
  scheduled_date: timestamp("scheduled_date"),
  status: matchStatusEnum("status").notNull().default("pending"),
  winner_id: integer("winner_id").references(() => participants.id, { onDelete: "set null" }),
  loser_id: integer("loser_id").references(() => participants.id, { onDelete: "set null" }),
  display_order: integer("display_order").notNull().default(0),
});
