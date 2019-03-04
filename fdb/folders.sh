#!/usr/bin/env bash

folders=(
"events"
"img"
)

for folder in "${folders[@]}"
do
  if [ ! -d "${folder}" ]; then
    echo create "$folder"
    mkdir "$folder"
  fi
done
