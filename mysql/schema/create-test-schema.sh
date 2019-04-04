#!/usr/bin/env bash
db=test
password=Qweasd12
event=$(cat $(pwd)/t_events.sql)

d1="DROP SCHEMA IF EXISTS $db;"
d2="CREATE DATABASE $db;"
d3="ALTER DATABASE $db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"

mysql -h localhost -u root -p"$password" -e "$d1"
mysql -h localhost -u root -p"$password" -e "$d2"
mysql -h localhost -u root -p"$password" -e "$d3"
mysql -h localhost -u root -p"$password" -D"$db" -e "$event"