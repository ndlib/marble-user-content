'use strict'
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const getHelper = require('./get')
const errors = require('./errors')
const headers = require('./headers')
const safeNull = require('./safeNull')
module.exports.update = async ({ id, table, primaryKey, allowedKeys, body }) => {
  if (!body) {
    return { statusCode: 400,
      headers: headers,
      body: errors.MISSING_PARAMS_BODY,
    }
  }

  if (!id) {
    return {
      statusCode: 400,
      headers: headers,
      body: errors.MISSING_PATH_ID,
    }
  }

  const editedItem = body === 'object' ? body : JSON.parse(body)
  const editedItemProperties = Object.keys(editedItem).filter(property => allowedKeys.includes(property))

  if (!editedItem || editedItemProperties.length < 1) {
    return {
      statusCode: 400,
      headers: headers,
      body: errors.NO_ARGS,
    }
  }

  // clean up null values
  editedItemProperties.forEach(property => {
    if (editedItem[property] === '' || editedItem[property] === null) {
      editedItem[property] = safeNull
    }
  })
  // add updated time
  editedItem.updated = Date.now()
  editedItemProperties.push('updated')

  const firstProperty = editedItemProperties.splice(0, 1)
  const params = {
    TableName: table,
    Key: {
      [primaryKey]: id,
    },
    UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
    ExpressionAttributeValues: {},
    ReturnValues: 'UPDATED_NEW',
  }
  params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`]

  editedItemProperties.forEach(property => {
    params.UpdateExpression += `, ${property} = :${property}`
    params.ExpressionAttributeValues[`:${property}`] = editedItem[property]
  })

  try {
    await db.update(params).promise()
    return getHelper.get({
      id: id,
      table: table,
      primaryKey: primaryKey,
    })
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword')
      ? errors.DYNAMODB_EXECUTION_ERROR : errors.RESERVED_RESPONSE
    return {
      statusCode: 500,
      headers: headers,
      body: errorResponse,
    }
  }
}
