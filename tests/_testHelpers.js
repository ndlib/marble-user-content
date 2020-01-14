// Shared functions useful for unit tests.

module.exports.mockAsyncFunc = (response) => {
  if (typeof response === 'function') {
    // Call the function and pass the arguments through to get the response.
    // This allows us to use the arguments passed in as the response for a mocked function, without knowing what the
    // input will be. (Implementation details)
    return jest.fn().mockImplementation((...args) => Promise.resolve(response(...args)))
  }
  return jest.fn().mockImplementation(() => Promise.resolve(response))
}