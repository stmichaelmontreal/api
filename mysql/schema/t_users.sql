SET character_set_client = utf8mb4;

CREATE TABLE t_users (
  id varchar(36) NOT NULL,
  parent_id varchar(36) NOT NULL,
  login varchar(20) NOT NULL,
  password varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  when_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY login_UNIQUE (login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
