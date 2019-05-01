SET character_set_client = utf8mb4;

CREATE TABLE t_events (
  id varchar(36) NOT NULL,
  title varchar(150) DEFAULT NULL,
  event_date date DEFAULT NULL,
  thumbnail varchar(50) DEFAULT NULL,
  img varchar(50) DEFAULT NULL,
  description mediumtext,
  when_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
