CREATE TABLE `engine_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`finished_at` text,
	`provider` text NOT NULL,
	`model` text,
	`trigger` text DEFAULT 'founder' NOT NULL,
	`tasks_run` integer DEFAULT 0 NOT NULL,
	`tasks_failed` integer DEFAULT 0 NOT NULL,
	`cost_usd_micros` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `approvals` ADD `options` text;--> statement-breakpoint
ALTER TABLE `approvals` ADD `choice` text;--> statement-breakpoint
ALTER TABLE `approvals` ADD `meta` text;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `engine_config` text DEFAULT '{"enabled":false,"maxTasksPerRun":3,"dailyBudgetUsdMicros":2000000}' NOT NULL;