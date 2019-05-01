#!/usr/bin/env bash
mysql --host=localhost --user=root --password=Qweasd12 --execute="DROP SCHEMA IF EXISTS test;"
mysql --host=localhost --user=root --password=Qweasd12 --execute="CREATE DATABASE test;"
mysql --host=localhost --user=root --password=Qweasd12 --execute="ALTER DATABASE test CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"
ev=$(pwd)/t_events.sql
echo $ev
mysql --host=localhost --user=root --password=Qweasd12 --database=test -e "/home/sv/WebstormProjects/api/mysql/schema/t_events.sql"
#mysql --host=localhost --user=root --password=Qweasd12 --database=test << $(cat $(pwd)/t_users.sql)
#mysql --host=localhost --user=root --password=Qweasd12 --database=test << $(cat $(pwd)/t_calendar.sql)
