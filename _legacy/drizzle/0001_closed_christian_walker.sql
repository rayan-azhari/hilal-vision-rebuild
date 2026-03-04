CREATE TABLE `observation_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255),
	`lat` decimal(10,7) NOT NULL,
	`lng` decimal(10,7) NOT NULL,
	`observationTime` timestamp NOT NULL,
	`temperature` decimal(6,2),
	`pressure` decimal(7,2),
	`cloudFraction` decimal(5,2),
	`pm25` decimal(6,2),
	`visualSuccess` enum('naked_eye','optical_aid','not_seen') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `observation_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`userId` varchar(255),
	`deviceType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `stripe_customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clerkUserId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_customers_clerkUserId_unique` UNIQUE(`clerkUserId`),
	CONSTRAINT `stripe_customers_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint
CREATE INDEX `obs_userId_idx` ON `observation_reports` (`userId`);--> statement-breakpoint
CREATE INDEX `obs_createdAt_idx` ON `observation_reports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `obs_lat_lng_idx` ON `observation_reports` (`lat`,`lng`);--> statement-breakpoint
CREATE INDEX `push_userId_idx` ON `push_tokens` (`userId`);