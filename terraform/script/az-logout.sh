#!/bin/bash

ID=$(jq -r '.[].appDisplayName' <<< $(az ad sp list --display-name dead-drop-sp)
echo "SP ID: ${ID}"

az ad sp delete --verbose --id "${ID}"

unset ARM_CLIENT_ID
unset ARM_CLIENT_SECRET
unset ARM_TENANT_ID
unset ARM_SUBSCRIPTION_ID

az logout
