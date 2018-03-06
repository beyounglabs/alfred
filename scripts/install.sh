#!/bin/bash
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
FOLDER_FULL_PATH=`realpath "$SCRIPTPATH/../../"`
FOLDER=`basename "$FOLDER_FULL_PATH"`

echo $SCRIPTPATH
echo $FOLDER

if [ $FOLDER == "node_modules" ]
then
    yarn tsc && cp -r dist/* .
fi
