CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`name` text NOT NULL,
	`time_sec` integer DEFAULT 0 NOT NULL,
	`update_time` integer NOT NULL
);
