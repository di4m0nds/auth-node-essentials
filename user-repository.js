import bcrypt from 'bcrypt'
import DBLocal from 'db-local'
import { SALT_ROUNDS } from './config.js'

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
    Validation.username(username)
    Validation.password(password)

    // Check if the username exists
    const user = User.findOne({ username })
    if (user) throw new Error('The user already exists.')

    // Some DBs are slow using "randomUUID()", just take care of that.
    const id = crypto.randomUUID()

    // const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS)
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({
      _id: id,
      username,
      password: hashPassword
    }).save()

    return id
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const user = User.findOne({ username })
    if (!user) throw new Error('Username not found.')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('An unexpected error happen. Something went wrong. Please try again later.')

    // return {     <-- GOOD WAY TO KNOW EXACTLY WHAT ARE YOU SENDING TO THE CLIENT
    //   id: user._id,
    //   username: user.username
    // }

    const { password: _, ...publicUserData } = user // <-- CLEVER WAY IF IT'S ONLY ONE VALUE TO BE IGNORED
    return publicUserData
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new Error(`The "username" must be a string. [${typeof username}]`)
    if (username.length < 3) throw new Error('The "username" must be at least 3 (three) characters long.')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error(`The "password" must be a string. [${typeof password}]`)
    if (password.length < 6) throw new Error('The "password" must be at least 6 (six) characters long.')
  }
}
