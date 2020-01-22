'use strict'
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const errors = require('./errors')

module.exports.delete = async ({ id, table, primaryKey, childrenName, childTable, childPrimaryKey, childSecondaryKey }) => {
  if (!id) {
    return { statusCode: 400, body: errors.MISSING_PATH_ID }
  }

  if (childrenName && childTable && childPrimaryKey && childSecondaryKey) {
    try {
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
      const childrenResponse = await db.query(childParams).promise()
      if (childrenResponse.Items && childrenResponse.Items.length > 0) {
        childrenResponse.Items.forEach(async (child) => {
          const childParams = {
            TableName: childTable,
            Key: {
              [childPrimaryKey]: child[childPrimaryKey],
            },
          }
          await db.delete(childParams).promise()
        })
      }
    } catch (error) {}
  }

  const params = {
    TableName: table,
    Key: {
      [primaryKey]: id,
    },
  }

  try {
    await db.delete(params).promise()
    return { statusCode: 204, body: '' }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) }
  }
}
