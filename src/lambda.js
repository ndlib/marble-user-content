'use strict'
const btoa = require('btoa')
const uuidv4 = require('uuid/v4')
const authorizer = require('./helpers/authorizer')
const createHelper = require('./helpers/create')
const getHelper = require('./helpers/get')
const updateHelper = require('./helpers/update')
const deleteHelper = require('./helpers/delete')
const allowedKeys = require('./helpers/keys')
const errors = require('./helpers/errors')
const headers = require('./helpers/headers')
const USER_TABLE_NAME = process.env.USER_TABLE_NAME || 'marble-user-content-users'
const USER_PRIMARY_KEY = process.env.USER_PRIMARY_KEY || 'uuid'
const USER_SECONDARY_KEY = process.env.USER_SECONDARY_KEY || 'userName'
const COLLECTION_TABLE_NAME = process.env.COLLECTION_TABLE_NAME || 'marble-user-content-collections'
const COLLECTION_PRIMARY_KEY = process.env.COLLECTION_PRIMARY_KEY || 'uuid'
const COLLECTION_SECONDARY_KEY = process.env.COLLECTION_SECONDARY_KEY || 'userId'
const ITEM_TABLE_NAME = process.env.ITEM_TABLE_NAME || 'marble-user-content-items'
const ITEM_PRIMARY_KEY = process.env.ITEM_PRIMARY_KEY || 'uuid'
const ITEM_SECONDARY_KEY = process.env.ITEM_SECONDARY_KEY || 'collectionId'

module.exports.handler = async (event) => {
  const props = await requestProps(event)

  if (['POST', 'PATCH', 'DELETE'].includes(event.httpMethod)) {
    const authorized = await canModify(event, props.claims)
    if (!authorized) {
      return {
        statusCode: 401,
        headers: headers,
        body: errors.UNAUTHORIZED,
      }
    }
  }

  switch (event.httpMethod) {
    case 'POST':
      if (event.resource.indexOf('user') !== 1) {
        props.parentId = props.id
        props.id = uuidv4()
      }
      return createHelper.create(props)

    case 'PATCH':
      return updateHelper.update(props)

    case 'DELETE':
      return deleteHelper.delete(props)

    case 'GET':
      if (event.resource.indexOf('user') === 1 && event.resource.indexOf('user-id') !== 1) {
        props.secondaryId = props.id
        props.secondaryKey = USER_SECONDARY_KEY
      }
      return getHelper.get(props)
    default:
      return {
        statusCode: 500,
        headers: headers,
        body: errors.UNKNOWN_REQUEST,
      }
  }
}

const requestProps = async (event) => {
  const props = {
    id: event.pathParameters.id,
    body: event.body,
    claims: await authorizer.verifyTokenAndReturnClaims(event.headers.Authorization) || {},
  }

  if (event.resource.indexOf('user') === 1) {
    props.table = USER_TABLE_NAME
    props.primaryKey = USER_PRIMARY_KEY
    props.allowedKeys = allowedKeys.user
    props.childrenName = 'collections'
    props.childTable = COLLECTION_TABLE_NAME
    props.childPrimaryKey = COLLECTION_PRIMARY_KEY
    props.childSecondaryKey = COLLECTION_SECONDARY_KEY
  } else if (event.resource.indexOf('collection') === 1) {
    props.table = COLLECTION_TABLE_NAME
    props.primaryKey = COLLECTION_PRIMARY_KEY
    props.allowedKeys = allowedKeys.collection
    props.childrenName = 'items'
    props.childTable = ITEM_TABLE_NAME
    props.childPrimaryKey = ITEM_PRIMARY_KEY
    props.childSecondaryKey = ITEM_SECONDARY_KEY
  } else if (event.resource.indexOf('item') === 1) {
    props.table = ITEM_TABLE_NAME
    props.primaryKey = ITEM_PRIMARY_KEY
    props.allowedKeys = allowedKeys.item
  }

  return props
}

const canModify = async (event, claims) => {
  if (userIdFromClaims(claims)) {
    if (event.resource.indexOf('user') === 1) {
      // users cannot currently be deleted
      if (event.httpMethod === 'DELETE') {
        return false
      }
      return userIdFromClaims(claims) === event.pathParameters.id
    } else if (event.resource.indexOf('collection') === 1) {
      // valid users can create new collections, but ownership must be checked before modify or delete
      if (event.httpMethod === 'POST') {
        return true
      }
      const collection = await getHelper.get({
        id: event.pathParameters.id,
        table: COLLECTION_TABLE_NAME,
        primaryKey: COLLECTION_PRIMARY_KEY,
      })
      return collection.statusCode === 200 && JSON.parse(collection.body)[COLLECTION_SECONDARY_KEY] === userIdFromClaims(claims)
    } else if (event.resource.indexOf('item') === 1) {
      // items must have a parent collection and user must match

      if (event.httpMethod === 'POST') {
        const parentCollection = await getHelper.get({
          id: event.pathParameters.id,
          table: COLLECTION_TABLE_NAME,
          primaryKey: COLLECTION_PRIMARY_KEY,
        })
        return parentCollection.statusCode === 200 && JSON.parse(parentCollection.body)[COLLECTION_SECONDARY_KEY] === userIdFromClaims(claims)
      }
      // get item then get collection    }
      const item = await getHelper.get({
        id: event.pathParameters.id,
        table: ITEM_TABLE_NAME,
        primaryKey: ITEM_PRIMARY_KEY,
      })
      if (item.statusCode === 200) {
        const collectionId = JSON.parse(item.body)[ITEM_SECONDARY_KEY]
        const collection = await getHelper.get({
          id: collectionId,
          table: COLLECTION_TABLE_NAME,
          primaryKey: COLLECTION_PRIMARY_KEY,
        })
        return collection.statusCode === 200 && JSON.parse(collection.body)[COLLECTION_SECONDARY_KEY] === userIdFromClaims(claims)
      }
    }
  }
  return false
}

const userIdFromClaims = (claims) => {
  const { iss, sub } = claims
  if (!iss || !sub) {
    return null
  }
  return `${sub}.${btoa(iss)}`
}
