'use strict'
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const getHelper = require('./get')
// const updateHelper = require('./update')
const errors = require('./errors')
const headers = require('./headers')
const safeNull = require('./safeNull')

module.exports.create = async ({ id, parentId, table, primaryKey, secondaryKey, allowedKeys, body }) => {
  if (!body) {
    return {
      statusCode: 400,
      headers: headers,
      body: errors.MISSING_PARAMS_BODY,
    }
  }
  if (secondaryKey && !parentId) {
    return {
      statusCode: 400,
      headers: headers,
      body: errors.MISSING_FOREIGN_KEY,
    }
  }

  // TODO: Verify object does not already exist

  const item = typeof body === 'object' ? body : JSON.parse(body)
  // Removed non-allowed keys and sanitize nulls
  const properties = Object.keys(item)
  properties.forEach(property => {
    if (!allowedKeys.includes(property)) {
      delete item[property]
    } else if (item[property] === '' || item[property] === null) {
      item[property] = safeNull
    }
  })
  item[primaryKey] = id
  if (secondaryKey) {
    item[secondaryKey] = parentId
  }
  const timestamp = Date.now()
  item.created = timestamp
  item.updated = timestamp

  const params = {
    TableName: table,
    Item: item,
  }

  try {
    await db.put(params).promise()
    const result = await getHelper.get({
      id: id,
      table: table,
      primaryKey: primaryKey,
    })
    result.statusCode = 201
    result.headers = headers
    return result
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword')
      ? errors.DYNAMODB_EXECUTION_ERROR : errors.RESERVED_RESPONSEE
    return {
      statusCode: 500,
      headers: headers,
      body: errorResponse,
    }
  }
}
