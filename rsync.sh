#!/bin/bash

project_path=$(pwd)
project_name="${project_path##*/}"
rsync -e 'ssh -i ~/.ssh/id_rsa.gxfeng' -av --delete --include='dist/***' --exclude='*' $(pwd)/ root@82.157.194.44:/opt/html/${project_name}/
