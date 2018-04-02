#!/bin/bash

set -e # fail on firstfail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
cd "${SCRIPT_DIR}/../";

rm -Rf dist
yarn build
yarn cli migrations:run
