import { DEFAULT_ERROR_MSG } from './config.js'

const createErrorFactory = function (name) {
  return class BusinessError extends Error {
    constructor (message) {
      super(message)
      this.name = name
    }
  }
}

export const UserValidationError = createErrorFactory('UserValidationError')
export const ConnectionValidationError = createErrorFactory('ConnectionValidationError')

export const errorHandler = (res, error) => {
  if (error.name === 'UserValidationError') {
    res.status(400).send({ error: error.message })
  } else {
    res.status(400).send({ error: DEFAULT_ERROR_MSG })
  }
}
