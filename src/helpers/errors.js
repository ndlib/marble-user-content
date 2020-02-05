module.exports = {
  DYNAMODB_EXECUTION_ERROR: 'Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.',
  MISSING_FOREIGN_KEY: 'Error: invalid request, you are missing a foreign key parameter',
  MISSING_PARAMS_BODY: 'Error: invalid request, you are missing the parameter body',
  MISSING_PATH_ID: 'Error: invalid request, you are missing the path parameter id',
  NO_ARGS: 'Error: invalid request, no arguments provided',
  NOT_FOUND: 'Error: the requested item could not be found',
  RESERVED_RESPONSE: 'Error: AWS reserved keywords used as attributes',
  UNAUTHORIZED: 'Error: missing or invalid authorization token for this action',
  UNKNOWN_REQUEST: 'Error: invalid request, unknown request',
}
