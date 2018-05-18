#!/bin/bash

set -e # fail on firstfail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
cd "${SCRIPT_DIR}/../";

yarn cli migration:generate -n $1
mv dist/database/migrations/*.ts database/migrations/
 