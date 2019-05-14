#!/usr/bin/env bash
mysql --host=localhost --user=root --password=Qweasd12 --execute="DROP SCHEMA IF EXISTS test;"
mysql --host=localhost --user=root --password=Qweasd12 --execute="CREATE DATABASE test;"
mysql --host=localhost --user=root --password=Qweasd12 --execute="ALTER DATABASE test CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"
mysql --host=localhost --user=root --password=Qweasd12 --database=test <<EOFMYSQL
$(cat $(pwd)/t_events.sql)
$(cat $(pwd)/t_calendar.sql)
$(cat $(pwd)/t_users.sql)
EOFMYSQL
