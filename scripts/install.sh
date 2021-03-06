#!/bin/bash
ORIGINAL_PATH=`pwd`;

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd "${SCRIPT_DIR}/../../../";

NODEMODULES_PATH=`pwd`;

NODEMODULES_DIR=`basename $(pwd)`;

cd $ORIGINAL_PATH;

if [ $NODEMODULES_DIR == "node_modules" ]
then
    # cat "${NODEMODULES_PATH}/../.git/config" | grep optimus && sed -i "s@es2017@es5@g" "${NODEMODULES_PATH}/alfred/tsconfig.json"
    if [ ! $BITBUCKET_BRANCH ]
    then
      FILES=$(find defaults -type f)
      while IFS= read -r FILE
      do
        echo "$FILE"
        node ${NODEMODULES_PATH}/@beyounglabs/alfred/scripts/cp.js "${NODEMODULES_PATH}/@beyounglabs/alfred/${FILE}"
      done < <(printf '%s\n' "$FILES")
    fi
fi


