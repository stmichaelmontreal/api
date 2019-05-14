SET character_set_client = utf8mb4;

CREATE TABLE t_calendar (
  id varchar(36) NOT NULL,
  calendar_date datetime NOT NULL,
  description mediumtext,
  when_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
