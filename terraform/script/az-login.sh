#!/bin/bash

ID=$(jq -r '.[].id' <<< $(az login))
echo "User ID: ${ID}"

LOGIN=$(az account set --subscription "${ID}")

if [[ ! $LOGIN ]]
then
    echo "az: LOGIN SUCCESSFUL"
else
    echo "az: LOGIN ERROR"
fi

SP=$(az ad sp create-for-rbac --name "dead-drop-sp" --role="Contributor" --scopes="/subscriptions/${ID}")
echo deaddrop-sp: $SP

export ARM_CLIENT_ID=$(jq '.appId' <<< ${SP})
export ARM_CLIENT_SECRET=$(jq '.password' <<< ${SP})
export ARM_TENANT_ID=$(jq '.tenant' <<< ${SP})
export ARM_SUBSCRIPTION_ID=${ID}
