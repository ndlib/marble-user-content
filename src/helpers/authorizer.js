'use strict'
const OktaJwtVerifier = require('@okta/jwt-verifier')
const TOKEN_ISSUER = process.env.TOKEN_ISSUER || ''
const TOKEN_AUDIENCE = process.env.TOKEN_AUDIENCE || ''

module.exports.verifyTokenAndReturnClaims = async (token) => {
  const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: TOKEN_ISSUER, // required
  })

  try {
    const result = await oktaJwtVerifier.verifyAccessToken(token, [TOKEN_AUDIENCE])
    return result.claims
  } catch (error) {
    return error
  }
}
