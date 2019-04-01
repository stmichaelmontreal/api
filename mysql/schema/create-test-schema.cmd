SET MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --host=localhost --user=root --password=Qweasd12
SET TEST=--database=test
%MYSQL% --execute="DROP SCHEMA IF EXISTS test;"
%MYSQL% --execute="CREATE DATABASE test;"
%MYSQL% %TEST% < t_events.sql
