# Marble User Content
## Description

Marble User Content consists of an AWS API Gateway, three AWS DynamoDB tables and several AWS Lambda functions to provide a CRUD API endpoint for user generated content on a [MARBLE](https://github.com/ndlib/marble-website-starter) site.

Use generated content consists of information about `Users`, user created `Collections`, and individual `Items` saved to those collections.

### API Endpoints
* `/user/{userName}`
  * `POST`
  * `GET`
  * `PATCH`


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

Deployment is documents in the [Marble Blueprints repository](https://github.com/ndlib/marble-blueprints).
## NOTES
 * Templated repo must setup Github integrations with continuous integration(ie Hound, Travis, CodeClimate, etc)
 * Sentry integration - https://docs.sentry.io/error-reporting/quickstart/?platform=javascript
