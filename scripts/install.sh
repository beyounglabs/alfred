#!/bin/bash
# SCRIPT_PATH=`realpath $0`
#SCRIPT_DIR=`basename $(pwd)`
ORIGINAL_PATH=`pwd`;

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd "${SCRIPT_DIR}/../../";

NODEMODULES_PATH=`pwd`;

NODEMODULES_DIR=`basename $(pwd)`;

cd $ORIGINAL_PATH;

if [ $NODEMODULES_DIR == "node_modules" ]
then
    yarn tsc
    cp -r dist/* .
    if [ ! $BITBUCKET_BRANCH ]
    then
      cp -r "${NODEMODULES_PATH}/alfred/defaults/." "${NODEMODULES_PATH}/../"
    fi
fi


