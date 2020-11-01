#!/bin/bash

PUBLISH_TYPE=$1

if [[ -z "$NPM_TOKEN" ]];then
  echo "No NPM_TOKEN, exiting.."
  exit 0;
fi

echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

echo "Publishing ${PUBLISH_TYPE}"

if [[ $PUBLISH_TYPE = "canary" ]]; then
  yarn release:canary --yes
  if [[ ! $? -eq 0 ]]; then
    exit 1
  else
    echo "Did not publish canary"
  fi
fi

if [[ $PUBLISH_TYPE = "stable" ]]; then
  yarn release --yes
  if [[ ! $? -eq 0 ]]; then
    exit 1
  else
    echo "Did not publish stable"
  fi
fi
