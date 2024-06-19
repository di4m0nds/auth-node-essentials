import bcrypt from 'bcrypt'
import DBLocal from 'db-local'
import { SALT_ROUNDS } from './config.js'

import { UserValidation } from './user-validation.js'
import { UserValidationError } from './error-factory.js'

const { Schema } = new DBLocal({ path: './db' })

// User Information
const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

// Improvements for the default contract:
// [] Dependecy injection
// [] Constructor

export class UserRepository {
  static async create ({ username, password }) {
    // Improvements:
    // [] Make validation with ZOD library
    UserValidation.username(username)
    UserValidation.password(password)

    // Check if the username exists
    const user = User.findOne({ username })
    if (user) throw new UserValidationError('The user already exists.')

    // Some DBs are slow using "randomUUID()", just take care of that.
    const id = crypto.randomUUID()

    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({
      _id: id,
      username,
      password: hashPassword
    }).save()

    return id
  }

  static async login ({ username, password }) {
    UserValidation.username(username)
    UserValidation.password(password)

    const user = User.findOne({ username })
    if (!user) throw new UserValidationError('Username not found.')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new UserValidationError('An unexpected error happen. Something went wrong. Please try again later.')

    // return {     <-- GOOD WAY TO KNOW EXACTLY WHAT ARE YOU SENDING TO THE CLIENT
    //   id: user._id,
    //   username: user.username
    // }

    const { password: _, ...publicUserData } = user // <-- CLEVER WAY IF IT'S ONLY ONE VALUE TO BE IGNORED
    return publicUserData
  }
}
