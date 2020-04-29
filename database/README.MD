# Database for tour-operator-credits-service

Set up a Docker image with the database schema and user required by the 
tour-operator-credits-service.

## Build the image

```
docker build -t tour-operator-credits-db:latest .
```

Uses a default postgres alpine image and copies the file `init-schema.sh` 
into the init folder to setup the database for the service.

## Run the image

```
docker run --rm \
  -e POSTGRES_PASSWORD=secret \
  -e TOUR_OPERATOR_CREDITS_USER=tour_operator_credits \
  -e TOUR_OPERATOR_CREDITS_PASSWORD=passw0rd! \
  -e TOUR_OPERATOR_CREDITS_DATABASE=tour_operator_credits \
  tour-operator-credits-db:latest
```

##### Required environment variables

- `POSTGRES_PASSWORD`: The password for the "postgres" superuser. This superuser 
is not used by the service, but needs some secure password anyway.
- `TOUR_OPERATOR_CREDITS_USER`: The name of the database user used by the service. 
This user has only the minimal rights required by the service.
- `TOUR_OPERATOR_CREDITS_PASSWORD`: The password for the `TOUR_OPERATOR_CREDITS_USER`.
- `TOUR_OPERATOR_CREDITS_DATABASE`: The name of database which is used by the service.
