'use strict'
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const errors = require('./errors')
const headers = require('./headers')

module.exports.get = async ({ id, table, primaryKey, childrenName, childTable, childSecondaryKey }) => {
  if (!id) {
    return { statusCode: 400, body: errors.MISSING_PATH_ID }
  }
  if (childTable && childSecondaryKey && childrenName) {
    return getItemWithChildren({
      id: id,
      table: table,
      primaryKey: primaryKey,
      childrenName: childrenName,
      childTable: childTable,
      childSecondaryKey: childSecondaryKey,
    })
  }
  return getItem({
    id: id,
    table: table,
    primaryKey: primaryKey,
  })
}

const getItem = async ({ id, table, primaryKey }) => {
  if (!id) {
    return { statusCode: 400, body: errors.MISSING_PATH_ID }
  }

  const params = {
    TableName: table,
    Key: {
      [primaryKey]: id,
    },
  }

  try {
    const response = await db.get(params).promise()
    if (response.Item) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(response.Item),
      }
    }
    return {
      statusCode: 404,
      headers: headers,
      body: errors.NOT_FOUND,
    }
  } catch (dbError) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(dbError),
    }
  }
}

const getItemWithChildren = async ({ id, table, primaryKey, childrenName, childTable, childSecondaryKey }) => {
  if (!id) {
    return {
      statusCode: 400,
      headers: headers,
      body: errors.MISSING_PATH_ID,
    }
  }

  const params = {
    TableName: table,
    Key: {
      [primaryKey]: id,
    },
  }

  const childParams = {
    TableName: childTable,
    IndexName: childSecondaryKey,
    KeyConditionExpression: `#field = :value`,
    ExpressionAttributeNames: {
      '#field': childSecondaryKey,
    },
    ExpressionAttributeValues: {
      ':value': id,
    },
  }

  try {
    const response = await db.get(params).promise()
    if (response.Item) {
      const childrenResponse = await db.query(childParams).promise()
      const result = response.Item
      if (childrenResponse.Items) {
        childrenResponse.Items.forEach(child => {
          delete child[childSecondaryKey]
        })
        result[childrenName] = childrenResponse.Items
      }
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(result),
      }
    }

    return {
      statusCode: 404,
      headers: headers,
      body: errors.NOT_FOUND,
    }
  } catch (dbError) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(dbError),
    }
  }
}
