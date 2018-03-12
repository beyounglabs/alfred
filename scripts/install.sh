#!/bin/bash
# SCRIPT_PATH=`realpath $0`
#SCRIPT_DIR=`basename $(pwd)`

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${SCRIPT_DIR}/../";

NODEMODULES_DIR=`basename $(pwd)`;

# NODEMODULES_PATH=`realpath "$SCRIPT_DIR/../../"`
# NODEMODULES_DIR=`basename "$SCRIPT_DIR/../../"`

echo $NODEMODULES_DIR;

if [ $NODEMODULES_DIR == "node_modules" ]
then
    yarn tsc
    cp -r dist/* .
    if [ ! $BITBUCKET_BRANCH ]
    then
      cp -r defaults/. "$NODEMODULES_PATH/../"
    fi
fi
