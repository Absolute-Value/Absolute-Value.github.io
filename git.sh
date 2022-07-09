#!/bin/sh

git add .
if [ $# -eq 0 ]; then
    git commit -m "Update"
else
    git commit -m "$1"
fi
git push
cd _site
git add .
if [ $# -ne 0 ]; then
    git commit -m "Update"
else
    git commit -m "$1"
fi
git push
cd ../