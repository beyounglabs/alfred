#!/bin/bash

set -e # fail on firstfail

: ${1?"Usage: $0 migration-name"}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
cd "${SCRIPT_DIR}/../";

yarn cli migration:create -n $1
mv dist/database/migrations/*.ts database/migrations/
chown -R docker: database/migrations/

