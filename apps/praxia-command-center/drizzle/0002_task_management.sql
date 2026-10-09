ALTER TABLE `agent_tasks` ADD `priority` text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `due_date` text;--> statement-breakpoint
ALTER TABLE `agent_tasks` ADD `progress` integer DEFAULT 0 NOT NULL;