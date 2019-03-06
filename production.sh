#!/usr/bin/env bash
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install git
sudo apt-get install nginx -y
sudo apt-get install -y nodejs
sudo npm install -g pm2

sudo systemctl enable nginx

# api
pm2 start server.js
pm2 startup
#run generated script
pm2 save


#vi /etc/nginx/sites-enabled/default
#
#location / {
#    root /var/www/web;
#    index index.html
#    try_files $uri $uri/ =404;
#}
#
#location /api/ {
#    proxy_pass http://localhost:5050;
#    proxy_http_version 1.1;
#}
#
#location /img/ {
#    root /var/www/fdb;
#    #expires 30d;
#    autoindex on;
#}


# api folder
git pull origin master
npm install --production



pm2 startup systemd

// create structuru

mkdir web
mkdir api
