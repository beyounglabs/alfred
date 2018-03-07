#!/bin/bash
SCRIPT_PATH=`realpath $0`
SCRIPT_DIR=`dirname $SCRIPT_PATH`

NODEMODULES_PATH=`realpath "$SCRIPT_DIR/../../"`
NODEMODULES_DIR=`basename "$NODEMODULES_PATH"`

if [ $NODEMODULES_DIR == "node_modules" ]
then
    yarn tsc
    cp -r dist/* .
    cp -r defaults/* "$NODEMODULES_PATH/../"
fi
