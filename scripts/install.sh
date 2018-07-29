#!/bin/bash
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
      rm -Rf dist
      FILES=$(find defaults -type f)
      while IFS= read -r FILE
      do
        echo "$FILE"
        node ${NODEMODULES_PATH}/alfred/scripts/cp.js "${NODEMODULES_PATH}/alfred/${FILE}"
      done < <(printf '%s\n' "$FILES")
    fi
fi


