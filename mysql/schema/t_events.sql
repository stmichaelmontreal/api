SET character_set_client = utf8mb4;

CREATE TABLE t_events (
  e_id varchar(36) NOT NULL,
  e_title varchar(150) DEFAULT NULL,
  e_date date DEFAULT NULL,
  e_thumbnail varchar(50) DEFAULT NULL,
  e_img varchar(50) DEFAULT NULL,
  e_description mediumtext,
  e_timestamp timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (e_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
