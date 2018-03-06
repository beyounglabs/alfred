#!/bin/bash
FOLDER=`basename "$PWD"`

if [ $FOLDER != "alfred" ]
then
    yarn tsc && cp -r dist/* .
fi
