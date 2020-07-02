#!/bin/bash
set -e # fail on firstfail

git remote -v | awk "{print $2}" | head -n 1 | grep -Po "(?<=\/)(\w+)(?! .git)" > repository.txt
git branch | awk "{print $2}" | head -n 1 | tr -s "* " " " >> repository.txt

yarn install
yarn test:reload
