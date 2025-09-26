PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`name` text NOT NULL,
	`time_sec` integer DEFAULT 0 NOT NULL,
	`video_id` text NOT NULL,
	`timestamp` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "channel_id", "name", "time_sec", "video_id", "timestamp") SELECT "id", "channel_id", "name", "time_sec", "video_id", "timestamp" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;