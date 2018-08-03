#!/bin/sh
yarnMd5=`md5sum yarn.lock | awk '{ print $1 }'`
bucketName='bbrands-pipelines-cache'
file=${yarnMd5}${1}.tar.xz

echo ${GCLOUD_CACHE_KEYFILE} | base64 -d > ./gcloud-api-key-cache.json

gcloud auth activate-service-account --key-file gcloud-api-key-cache.json

gsutil -q stat gs://${bucketName}/node_modules/${file} &> /dev/null
fileExists=$?

set -e

if [ $fileExists = 0 ]; then
  rm -Rf node_modules
  echo "Downloading from gcloud"
  gsutil cp gs://${bucketName}/node_modules/${file} .
  echo "Unpacking"
  tar -xf ${file}
  echo "Coping node_modules to container"
  docker cp node_modules build:/var/www/html/node_modules
else
  echo "Installing dependencies"
  docker exec build yarn install $1
  echo "Coping node_modules from container"
  docker cp build:/var/www/html/node_modules node_modules
  echo "Compressing"
  tar c node_modules | xz > ${file}
  echo "Sending to Cloud Storage"
  gsutil cp ${file} gs://${bucketName}/node_modules/
fi

rm -Rf ${file}

gcloud auth activate-service-account --key-file gcloud-api-key.json
