#!/bin/bash

DIR="/var/www/html/node_modules"

if [ -d "$DIR" ]; then
    yarn start
else
    cp -r /home/docker/.ssh/ /root/
    chown -R root:root /root/.ssh 
    chmod -R 700 /root/.ssh 
    yarn install
    chown -R docker:docker $DIR
    yarn start
fi