SET MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --host=localhost --user=root --password=Qweasd12
SET DB=--database=test
%MYSQL% --execute="DROP SCHEMA IF EXISTS test;"
%MYSQL% --execute="CREATE DATABASE test;"
%MYSQL% %DB% < t_events.sql
%MYSQL% %DB% < t_users.sql
