# tour-operator-credits-service

## Purpose

Some tour operators give customers a voucher/coupon/credit in case of a canceled booking 
instead of paying them back their money directly. The customer can use the credit to pay future 
travels partly or completely with the same tour operator.

Online travel agencies have the issue, that there is no generic possibility to validate the 
credits of a customer who wants to book a travel. The purpose of this service is to solve 
this problem.

The idea is that tour operators upload the credits of customers to an instance of this 
service running on servers of the travel agency. The travel agency can then look up the credits
any time and communicate the price reduction during the booking process.

## Usage

### POST /credits/:tourOperatorId

Adds or updates credits. The `tourOperatorId` must be a valid tour operator UUID (see a list of
possible tour operators [here](./tour-operators.csv)).

The header must contain `Content-Type: text/csv`.

The body must contain a CSV file with comma-separated fields. Double quotes should 
be used to enclose the fields. The first row does not need to include the headers, but they 
are removed if found.

It requires the following columns in this order (for optional values provide an empty string):

- *email* (required): The email address of the Urlauber.
- *amount* (required): The amount of credit the Urlauber has left in decimal format (`ddd.dd`) 
(set to `0.00` to remove any credit).
- *currencyCode* (required): The currency of the credit. Allowed value is `EUR` or `CHF`.
- *code* (optional): The Urlauber has to provide this code to use the credit.
- *validUntilDate* (optional): The credit can only be used until (including) this date in 
ISO-8601 format (`yyyy-mm-dd`).
- *tourOperatorInternalNumber* (optional): ID of booking used by tour operator. 
The number which is sent via Toma/Amadeus to the travel offices. 
Aka "Veranstalter Vorgangsnummer", "Reservierungsnummer".

#### Example

credits.csv:
```csv
"urlauber@aol.com","233.12","EUR","COR-12553","2021-12-31","930906391"
"urlauber@hotmail.com","11.00","CHF",,,
```
cUrl:
```bash
curl -X POST -H 'Content-Type: text/csv' --data-binary @credits.csv http://localhost:3000/credits/b3d2e944-38d1-46a3-a878-7fdd0c25bf4f
```

### GET /credits/:tourOperatorId/upload/

Simple upload page to call the POST credits endpoint via an interface

#### Examples

http://localhost:3000/credits/b3d2e944-38d1-46a3-a878-7fdd0c25bf4f/upload/

### GET /balance

The following query parameters are possible:

- *tourOperatorId* (required): A valid tour operator UUID ([see here](./tour-operators.csv))
- *email* (required): The email address of the Urlauber
- *code* (optional): The code to use the credit

Returns the following JSON:

```json
{
   "amount": 123.12, 
   "currencyCode": "CHF" 
}
```

When tourOperatorId, email or code cannot be found, it will return an amount of 0:

```json
{
   "amount": 0, 
   "currencyCode": "EUR" 
}
```

#### Examples

http://localhost:3000/balance?tourOperatorId=b3d2e944-38d1-46a3-a878-7fdd0c25bf4f&email=urlauber@hotmail.com

### GET /_readiness

Return a status code of 200 when the service is running, the connection to the database is 
working and the table in the database can be accessed. Otherwise it will return a 503.

It will also return a 503 when the service is getting shut down and should not receive any new
requests.

Useful for a load balancer to find out, if the service is ready to accept traffic.

### GET /_health

Return a status code of 200 when the service is running.

Useful to find out, if the service has started correctly or has any kind of major issue and
needs a restart.

## Development

### Required tools

- NodeJS (see required version [here](.nvmrc)): https://nodejs.org/en/download/
- Docker (version from 19.03 are supported): https://www.docker.com/get-started

### Useful commands
- `nvm use`: Be sure using the right node version.
- `npm install`: Install all required dependencies.
- `npm run dev`: Start service connected to a temporary database. 
Restarts automatically when code has changed.
- `npm prettier`: Formats the code. Also executed before any commit.

#### Run the service with Docker
To run the service locally simply call
```shell script
docker-compose up -d
```
This will spin up docker containers running a local database and a local instance of the service.
You can then perform any calls like described in the [Usage section](#Usage).
Alternatively you can use
```shell script
docker-compose up -d --build
```
To be sure that the images are newly built, e.g. if you made any changes.

To stop and remove the containers use
```shell script
    docker-compose down
```
This will also delete any data that was inserted to the local database.

Alternatively you can use
```shell script
    docker-compose stop
```
to only stop the containers.

Also refer to the docker-compose [documentation](https://docs.docker.com/compose/reference/overview/).

## Database

A PostgreSQL database stores the credits. A docker image definition with the required 
database setup can be found [here](./database).

The required schema is defined [here](./database/init-schema.sh#L21).

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
