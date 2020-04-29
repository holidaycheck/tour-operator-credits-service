#!/bin/bash

set -o errexit

readonly REQUIRED_ENV_VARS=(
  "TOUR_OPERATOR_CREDITS_USER"
  "TOUR_OPERATOR_CREDITS_PASSWORD"
  "TOUR_OPERATOR_CREDITS_DATABASE"
)

check_env_vars_set() {
  for required_env_var in ${REQUIRED_ENV_VARS[@]}; do
    if [[ -z "${!required_env_var}" ]]; then
      echo "Error: Environment variable '$required_env_var' not set.
        Make sure you have the following environment variables set: ${REQUIRED_ENV_VARS[@]}"
      exit 1
    fi
  done
}

init_user_and_db() {
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE $TOUR_OPERATOR_CREDITS_DATABASE;

    \c $TOUR_OPERATOR_CREDITS_DATABASE

    CREATE TYPE CURRENCYCODE AS ENUM ('EUR', 'CHF');

    CREATE SEQUENCE credits_id_seq;

    CREATE TABLE credits (
      id integer PRIMARY KEY DEFAULT nextval('credits_id_seq'),
      touroperatorid UUID NOT NULL,
      email VARCHAR(1024) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currencycode CURRENCYCODE NOT NULL,
      code VARCHAR(1024),
      validuntildate DATE,
      touroperatorinternalnumber VARCHAR(1024),
      entrydate TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX ON credits (touroperatorid ASC, email ASC, code ASC, entrydate DESC);

    CREATE USER $TOUR_OPERATOR_CREDITS_USER WITH PASSWORD '$TOUR_OPERATOR_CREDITS_PASSWORD';

    GRANT SELECT,USAGE ON SEQUENCE credits_id_seq TO $TOUR_OPERATOR_CREDITS_USER;

    GRANT SELECT,INSERT,UPDATE ON TABLE credits TO $TOUR_OPERATOR_CREDITS_USER;
EOSQL
}

main() {
  check_env_vars_set
  init_user_and_db
}

main "$@"
