# Marble User Content
## Description

Marble User Content consists of an AWS API Gateway, three AWS DynamoDB tables and several AWS Lambda functions to provide a CRUD API endpoint for user generated content on a [MARBLE](https://github.com/ndlib/marble-website-starter) site.

Use generated content consists of information about `Users`, user created `Collections`, and individual `Items` saved to those collections.

`collectionId` and `itemId` are generated automatically on a successful `POST` request using `uuid` version 4. `userId` is a hash using information from the JWT, specifically it is formatted `[sub]`.`[btoa(iss)]` where `sub` is a guaranteed static unique value to identify a user within the scope of an issuer `iss`. `iss` is the url for the JWT issuer. Since it is a url, it has been base64 encoded to make the string simpler to parse should the need arise. (Simply split the string on `.` and `atob` the second part to get the url of the issuer again.)

### API Endpoints
* `/user/{userId}`
  * `POST`
  * `PATCH`
  * `DELETE`
* `/user/{userName}`
  * `GET`

* `/user-id/{userId}`
  * `GET`

* `/collection/{userName}`
  * `POST`
* `/collection/{collectionId}`
  * `GET`
  * `PATCH`
  * `DELETE`


* `/item/{collectionId}`
  * `POST`
* `/item/{itemId}`
  * `GET`
  * `PATCH`
  * `DELETE`

### Allowed fields on content types

  See `/src/helpers/keys.js`.

## Installation

Perform a yarn installation in the main project directory and also in the `src` directory.

```
yarn
cd src
yarn
```

## Testing

## Dependencies

The code for this Lambda relies on the infrastructure created by the [Marble Blueprints repository](https://github.com/ndlib/marble-blueprints) specified in the [`user-content` directory](https://github.com/ndlib/marble-blueprints/tree/master/deploy/cdk/lib/user-content).

## Deployment

Deployment is documented in the [Marble Blueprints repository](https://github.com/ndlib/marble-blueprints).
## NOTES
 * Templated repo must setup Github integrations with continuous integration(ie Hound, Travis, CodeClimate, etc)
 * Sentry integration - https://docs.sentry.io/error-reporting/quickstart/?platform=javascript
