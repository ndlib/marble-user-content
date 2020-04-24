'use strict'
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const errors = require('./errors')
const headers = require('./headers')
const safeNull = require('./safeNull')
const USER_TABLE_NAME = process.env.USER_TABLE_NAME || 'marble-user-content-users'

module.exports.get = async ({ id, table, primaryKey, secondaryKey, secondaryId, childrenName, childTable, childSecondaryKey }) => {
  if (!id) {
    return { statusCode: 400, body: errors.MISSING_PATH_ID }
  }
  let params = {
    TableName: table,
    Key: {
      [primaryKey]: id,
    },
  }
  if (secondaryKey && table === USER_TABLE_NAME) {
    params = {
      TableName: table,
      IndexName: secondaryKey,
      KeyConditionExpression: `#field = :value`,
      ExpressionAttributeNames: {
        '#field': secondaryKey,
      },
      ExpressionAttributeValues: {
        ':value': secondaryId,
      },
    }
  }

  if (childTable && childSecondaryKey && childrenName) {
    const parent = await getItem(params)
    const searchId = JSON.parse(parent.body)[primaryKey]

    const childParams = {
      TableName: childTable,
      IndexName: childSecondaryKey,
      KeyConditionExpression: `#field = :value`,
      ExpressionAttributeNames: {
        '#field': childSecondaryKey,
      },
      ExpressionAttributeValues: {
        ':value': searchId,
      },
    }
    return getItemWithChildren(params, childParams, childrenName, childSecondaryKey)
  }
  return getItem(params)
}

const getItem = async (params) => {
  try {
    if (params.Key) {
      const response = await db.get(params).promise()
      if (response.Item) {
        return {
          statusCode: 200,
          headers: headers,
          body: JSON.stringify(response.Item).replace(new RegExp(safeNull, 'g'), ''),
        }
      }
    } else if (params.KeyConditionExpression) {
      const response = await db.query(params).promise()
      if (response.Items) {
        return {
          statusCode: 200,
          headers: headers,
          body: JSON.stringify(response.Items[0]).replace(new RegExp(safeNull, 'g'), ''),
        }
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

const getItemWithChildren = async (params, childParams, childrenName, childSecondaryKey) => {
  try {
    let response = null
    if (params.Key) {
      response = await db.get(params).promise()
    } else if (params.KeyConditionExpression) {
      response = await db.query(params).promise()
      if (response.Items) {
        response.Item = response.Items[0]
      }
    }
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
        body: JSON.stringify(result).replace(new RegExp(safeNull, 'g'), ''),
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
