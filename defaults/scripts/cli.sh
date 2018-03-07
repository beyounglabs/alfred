#!/bin/bash
[[ $NODE_ENV == "development" ]] && ts-node ./scripts/cli "$@" || echo node ./dist/scripts/cli "$@"