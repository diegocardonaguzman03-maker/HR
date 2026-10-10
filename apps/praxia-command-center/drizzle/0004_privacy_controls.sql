CREATE TABLE `suppressions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`value_hash` text NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppression_unique` ON `suppressions` (`kind`,`value_hash`);--> statement-breakpoint
ALTER TABLE `company_settings` ADD `privacy_notice_version` text;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `privacy_notice_url` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `residence_country` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `basis_assessed_by` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `basis_assessed_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `privacy_notice_version` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `privacy_notice_delivered_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `opt_out_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `opt_out_channel` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `source_verified_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `retain_until` text;