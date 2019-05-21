#!/usr/bin/env bash
db=$(cat $(pwd)/db)
mysql --host=localhost -u root -e "DROP SCHEMA IF EXISTS $db;"
mysql --host=localhost -u root -e "CREATE DATABASE $db;"
mysql --host=localhost -u root -e "ALTER DATABASE $db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"
mysql --host=localhost -u root <<EOFMYSQL
USE $(cat $(pwd)/db)
$(cat $(pwd)/t_events.sql)
$(cat $(pwd)/t_calendar.sql)
$(cat $(pwd)/t_users.sql)
EOFMYSQL
