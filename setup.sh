#!/bin/bash

# grab the latest linter
TEMPLATE_LINTER_PATH="https://raw.githubusercontent.com/ndlib/wse-js-template/master/"
TEMPLATE_LINTER_FILE=".eslintrc"
TEMPLATE_IGNORE_FILE=".eslintignore"
TEMPLATE_LINTER=${TEMPLATE_LINTER_PATH}${TEMPLATE_LINTER_FILE}
TEMPLATE_IGNORE=${TEMPLATE_LINTER_PATH}${TEMPLATE_IGNORE_FILE}

curl ${TEMPLATE_LINTER} -o ${TEMPLATE_LINTER_FILE} -s
curl ${TEMPLATE_IGNORE} -o ${TEMPLATE_IGNORE_FILE} -s

# install
yarn

cd ./src && yarn