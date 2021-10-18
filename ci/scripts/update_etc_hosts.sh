#!/bin/bash

# What is the purpose of this script? Why was it made?

# Problem
# The test can not run properly because of DNS routing issues for the url we want to use.

# Solution
# Add dns entries into the /etc/hosts file to support being able to run the tests.

echo "***** ADDING MISSING ENTRIES TO /etc/hosts FILE IF NECESSARY"

entries=(
    '8xbq19z1.manage.dev.zesty.io'
    '8xbq19z1-dev.preview.dev.zesty.io'
    '8-f48cf3a682-7fthvk.api.dev.zesty.io'
    '8-f48cf3a682-7fthvk.manager.dev.zesty.io'
)

#  https://github.com/cypress-io/cypress/issues/680#issuecomment-506857092
echo "mapping localhost to 127.0.0.1 in /etc/hosts"
sudo echo "127.0.0.1 localhost" | sudo tee -a /etc/hosts
if [ $? -ne 0 ]; then
    echo "failed to add entry for 'localhost $entry'"
    exit 1
fi

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