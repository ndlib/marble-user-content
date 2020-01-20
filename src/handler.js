'use strict'
const uuidv4 = require('uuid/v4')
const createHelper = require('./helpers/create')
const getHelper = require('./helpers/get')
const updateHelper = require('./helpers/update')
const deleteHelper = require('./helpers/delete')
const allowedKeys = require('./helpers/keys')
const errors = require('./helpers/errors')
const USER_TABLE_NAME = process.env.USER_TABLE_NAME || 'marble-user-content-users'
const USER_PRIMARY_KEY = process.env.USER_PRIMARY_KEY || 'userName'
const COLLECTION_TABLE_NAME = process.env.COLLECTION_TABLE_NAME || 'marble-user-content-collections'
const COLLECTION_PRIMARY_KEY = process.env.COLLECTION_PRIMARY_KEY || 'uuid'
const COLLECTION_SECONDARY_KEY = process.env.COLLECTION_SECONDARY_KEY || 'userName'
const ITEM_TABLE_NAME = process.env.ITEM_TABLE_NAME || 'marble-user-content-items'
const ITEM_PRIMARY_KEY = process.env.ITEM_PRIMARY_KEY || 'uuid'
const ITEM_SECONDARY_KEY = process.env.ITEM_SECONDARY_KEY || 'collection'

module.exports.handler = async (event) => {
  const props = requestProps(event)

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
      if (event.resource.indexOf('user') === 1) {
        return { statusCode: 405, body: errors.FORBIDDEN }
      }
      return deleteHelper.delete(props)
    case 'GET':
    default:
      return getHelper.get(props)
  }
}

const requestProps = (event) => {
  const props = {
    id: event.pathParameters.id,
    body: event.body,
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
    props.secondaryKey = COLLECTION_SECONDARY_KEY
    props.allowedKeys = allowedKeys.collection
    props.childrenName = 'items'
    props.childTable = ITEM_TABLE_NAME
    props.childPrimaryKey = ITEM_PRIMARY_KEY
    props.childSecondaryKey = ITEM_SECONDARY_KEY
  } else if (event.resource.indexOf('item') === 1) {
    props.table = ITEM_TABLE_NAME
    props.primaryKey = ITEM_PRIMARY_KEY
    props.secondaryKey = ITEM_SECONDARY_KEY
    props.allowedKeys = allowedKeys.item
  }

  return props
}
