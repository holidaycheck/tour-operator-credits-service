#!/bin/bash

cd "$(dirname "$0")"

set -o errexit

readonly service_image_name="tour-operator-credits-service:$(git rev-parse --short HEAD)"

readonly docker_compose_file="docker-compose.yml"
readonly docker_compose_project_name="tour-operator-service"

echo "imagename: " $service_image_name

sed -e "s/SERVICE_IMAGE_NAME/$service_image_name/" docker-compose-template.yml > ${docker_compose_file}

docker-compose -f ${docker_compose_file} -p ${docker_compose_project_name} build

docker-compose -f ${docker_compose_file} -p ${docker_compose_project_name} up -d  && (
  docker-compose -f ${docker_compose_file} -p ${docker_compose_project_name} ps
  echo "call 'docker-compose down' to stop the containers"
) || true
