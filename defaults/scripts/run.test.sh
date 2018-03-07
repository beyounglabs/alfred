#!/bin/bash
set -e # fail on firstfail
echo "127.0.0.1	redis" >> /etc/hosts
echo "127.0.0.1	redis_consul" >> /etc/hosts

# Access to other bitbucket repos
echo "Host bitbucket.org" >> ~/.ssh/config
echo "  HostName bitbucket.org" >> ~/.ssh/config
echo "  User git" >> ~/.ssh/config
echo "  IdentityFile \"/opt/atlassian/pipelines/agent/data/id_rsa\"" >> ~/.ssh/config
echo "  IdentitiesOnly yes" >> ~/.ssh/config

yarn install
git remote -v | awk "{print $2}" | head -n 1 | grep -Po "(?<=\/)(\w+)(?! .git)" > repository.txt
git branch | awk "{print $2}" | head -n 1 | tr -s "* " " " >> repository.txt
yarn test:reload
