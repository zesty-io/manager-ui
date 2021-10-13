#!/bin/bash

# What is the purpose of this script? Why was it made?

# Problem
# The test can not run properly because of DNS routing issues for the url we want to use.

# Solution
# Add dns entries into the /etc/hosts file to support being able to run the tests.

echo "***** ADDING MISSING ENTRIES TO /etc/hosts FILE IF NECESSARY"

entries=(
    'cbgqq67s.manage.zesty.localdev'
    'cbgqq67s-dev.preview.zesty.localdev'
    '8-d0dca6e3d1-fskzdv.api.zesty.localdev'
    '8-d0dca6e3d1-fskzdv.manager.zesty.localdev'
    'accounts.zesty.localdev'
    'accounts.api.zesty.localdev'
    'auth.api.zesty.localdev'
    'redis-gateway.zesty.localdev'
    'svc.zesty.localdev'
    'preview.zesty.localdev'
)

for entry in ${entries[@]}; do
    if [ $(cat /etc/hosts | grep $entry | wc -l) -gt 0 ]; then
    echo "entry '127.0.0.1 $entry' already exists in /etc/hosts"
    else
        echo "adding entry for '127.0.0.1 $entry' to /etc/hosts"
        sudo echo "127.0.0.1 $entry" | sudo tee -a /etc/hosts
        if [ $? -ne 0 ]; then
            echo "failed to add entry for '127.0.0.1 $entry'"
            exit 1
        fi
    fi
done