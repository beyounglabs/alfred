#!/bin/bash
[[ $NODE_ENV == "development" ]] && ts-node ./scripts/cli "$@" || node ./dist/scripts/cli "$@"
