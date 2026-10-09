CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`direction` text DEFAULT 'internal' NOT NULL,
	`subject` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`occurred_at` text NOT NULL,
	`organization_id` text,
	`contact_id` text,
	`opportunity_id` text,
	`actor` text DEFAULT 'founder' NOT NULL,
	`recorded_manually` integer DEFAULT true NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `act_opp` ON `activities` (`opportunity_id`);--> statement-breakpoint
CREATE INDEX `act_org` ON `activities` (`organization_id`);--> statement-breakpoint
CREATE TABLE `agent_events` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`task_id` text,
	`type` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `agent_tasks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `event_agent_at` ON `agent_events` (`agent_id`,`at`);--> statement-breakpoint
CREATE TABLE `agent_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`title` text NOT NULL,
	`instructions` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`origin` text DEFAULT 'founder' NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`output` text,
	`error_message` text,
	`cost_usd_micros` integer DEFAULT 0 NOT NULL,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `task_agent` ON `agent_tasks` (`agent_id`);--> statement-breakpoint
CREATE INDEX `task_status` ON `agent_tasks` (`status`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`team` text NOT NULL,
	`reports_to` text NOT NULL,
	`description` text NOT NULL,
	`instructions_path` text NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`allowed_tools` text DEFAULT '[]' NOT NULL,
	`data_access_policy` text DEFAULT 'internal-read' NOT NULL,
	`model_config` text DEFAULT '{"provider":null,"model":null}' NOT NULL,
	`escalation_rules` text DEFAULT 'Escalate strategy/financial decisions to CEO-01 and the founder.' NOT NULL,
	`avatar` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agents_slug_unique` ON `agents` (`slug`);--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`requested_by` text DEFAULT 'system' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`decision_note` text,
	`decided_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `approval_status` ON `approvals` (`status`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before` text,
	`after` text
);
--> statement-breakpoint
CREATE INDEX `audit_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`company_name` text DEFAULT 'PRAXIA' NOT NULL,
	`reporting_currency` text DEFAULT 'USD' NOT NULL,
	`opening_cash_amount` integer,
	`opening_cash_currency` text,
	`opening_cash_date` text,
	`monthly_revenue_target` integer DEFAULT 1000000 NOT NULL,
	`monthly_revenue_target_currency` text DEFAULT 'USD' NOT NULL,
	`target_basis` text DEFAULT 'recognized' NOT NULL,
	`default_tax_rate` real DEFAULT 0.16 NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`full_name` text NOT NULL,
	`title` text,
	`email` text,
	`email_status` text DEFAULT 'unverified' NOT NULL,
	`linkedin_url` text,
	`geography` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`source_retrieved_at` text,
	`lawful_basis` text DEFAULT 'not_assessed' NOT NULL,
	`lead_status` text DEFAULT 'new' NOT NULL,
	`lead_score` integer,
	`owner_agent_id` text,
	`do_not_contact` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contact_org` ON `contacts` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `contact_email_unique` ON `contacts` (`email`);--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`opportunity_id` text,
	`proposal_id` text,
	`title` text NOT NULL,
	`kind` text DEFAULT 'project' NOT NULL,
	`currency` text NOT NULL,
	`total_amount` integer NOT NULL,
	`monthly_amount` integer,
	`start_date` text,
	`end_date` text,
	`status` text DEFAULT 'pending_signature' NOT NULL,
	`signed_at` text,
	`signature_evidence` text,
	`fx_rate` real,
	`fx_source` text,
	`fx_rate_date` text,
	`reporting_currency` text,
	`reporting_amount` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`incurred_on` text NOT NULL,
	`vendor` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`cost_type` text DEFAULT 'overhead' NOT NULL,
	`contract_id` text,
	`recurrence` text DEFAULT 'none' NOT NULL,
	`status` text DEFAULT 'actual' NOT NULL,
	`fx_rate` real,
	`fx_source` text,
	`fx_rate_date` text,
	`reporting_currency` text,
	`reporting_amount` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `fx_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`base` text NOT NULL,
	`quote` text NOT NULL,
	`rate` real NOT NULL,
	`source` text NOT NULL,
	`rate_date` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `fx_pair_date` ON `fx_rates` (`base`,`quote`,`rate_date`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`organization_id` text NOT NULL,
	`contract_id` text,
	`issue_date` text NOT NULL,
	`due_date` text NOT NULL,
	`currency` text NOT NULL,
	`subtotal` integer NOT NULL,
	`tax_rate` real DEFAULT 0 NOT NULL,
	`tax` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`fx_rate` real,
	`fx_source` text,
	`fx_rate_date` text,
	`reporting_currency` text,
	`reporting_amount` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`primary_contact_id` text,
	`service_id` text,
	`stage_id` text NOT NULL,
	`title` text NOT NULL,
	`problem_statement` text DEFAULT '' NOT NULL,
	`proposed_solution` text DEFAULT '' NOT NULL,
	`amount` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`probability_override` real,
	`expected_close_date` text,
	`next_action` text,
	`next_action_date` text,
	`owner_agent_id` text,
	`risks` text DEFAULT '' NOT NULL,
	`lost_reason` text,
	`max_stage_position` integer DEFAULT 1 NOT NULL,
	`stage_entered_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`closed_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`primary_contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`stage_id`) REFERENCES `pipeline_stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `opp_stage` ON `opportunities` (`stage_id`);--> statement-breakpoint
CREATE INDEX `opp_org` ON `opportunities` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`website` text,
	`industry` text,
	`country` text,
	`size_band` text,
	`revenue_band` text,
	`linkedin_url` text,
	`lifecycle` text DEFAULT 'target' NOT NULL,
	`fit_score` integer,
	`notes` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`source_retrieved_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `org_domain_unique` ON `organizations` (`domain`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`received_on` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`method` text DEFAULT 'transfer' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`fx_rate` real,
	`fx_source` text,
	`fx_rate_date` text,
	`reporting_currency` text,
	`reporting_amount` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pipeline_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`default_probability` real NOT NULL,
	`kind` text DEFAULT 'open' NOT NULL,
	`required_fields` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pipeline_stages_key_unique` ON `pipeline_stages` (`key`);--> statement-breakpoint
CREATE TABLE `proposal_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`service_id` text,
	`description` text NOT NULL,
	`milestone` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`estimated_cost` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`tax_rate` real DEFAULT 0.16 NOT NULL,
	`valid_until` text,
	`approved_at` text,
	`sent_at` text,
	`decided_at` text,
	`acceptance_evidence` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `revenue_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`recognized_on` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`basis` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`fx_rate` real,
	`fx_source` text,
	`fx_rate_date` text,
	`reporting_currency` text,
	`reporting_amount` integer,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`pricing_model` text DEFAULT 'fixed' NOT NULL,
	`price_min` integer,
	`price_max` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`typical_weeks` text,
	`pricing_status` text DEFAULT 'proposed' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_code_unique` ON `services` (`code`);