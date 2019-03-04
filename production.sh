#!/usr/bin/env bash
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install nginx -y
sudo systemctl enable nginx
vi /etc/nginx/sites-enabled/default


curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y nodejs


sudo npm install -g pm2







pm2 start server.js
pm2 startup systemd

// create structuru

mkdir fdb
mkdir web
mkdir api
