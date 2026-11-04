CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"event_name" varchar(50) NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
