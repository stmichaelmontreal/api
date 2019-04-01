#!/usr/bin/env bash
mysql --host=localhost --user=root --password=Qweasd12 --execute="DROP SCHEMA IF EXISTS test;"
mysql --host=localhost --user=root --password=Qweasd12 --execute="CREATE DATABASE test;"
mysql --host=localhost --user=root --password=Qweasd12 --database=test < $(pwd)/t_events.sql