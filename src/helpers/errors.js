module.exports = {
  DYNAMODB_EXECUTION_ERROR: 'Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.',
  MISSING_FOREIGN_KEY: 'invalid request, you are missing a foreign key parameter',
  MISSING_PARAMS_BODY: 'invalid request, you are missing the parameter body',
  MISSING_PATH_ID: 'invalid request, you are missing the path parameter id',
  NO_ARGS: 'invalid request, no arguments provided',
  NOT_FOUND: 'the requested item could not be found',
  RESERVED_RESPONSE: 'Error: AWS reserved keywords used as attributes',
  UNAUTHORIZED: 'missing or invalid authorization token for this action',
}
