import { UserValidationError } from './error-factory.js'

export class UserValidation {
  static username (username) {
    if (typeof username !== 'string') throw new UserValidationError(`The "username" must be a string. [${typeof username}]`)
    if (username.length < 3) throw new UserValidationError('The "username" must be at least 3 (three) characters long.')
  }

  static password (password) {
    if (typeof password !== 'string') throw new UserValidationError(`The "password" must be a string. [${typeof password}]`)
    if (password.length < 6) throw new UserValidationError('The "password" must be at least 6 (six) characters long.')
  }
}
