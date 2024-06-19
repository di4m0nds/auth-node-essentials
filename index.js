import express from 'express'
import jwt from 'jsonwebtoken'
import { TEACHER_LINK, TEACHER_NAME, PORT, SECRET_TOKEN_KEY, ACCESS_TOKEN } from './config.js'

import { UserRepository } from './user-repository.js'
import cookieParser from 'cookie-parser'
import { errorHandler } from './error-factory.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json()) // Check if the request has a body (for "req.body")
app.use(cookieParser()) // Allow us to use & handle cookies

app.use((req, res, next) => {
  const token = req.cookies[ACCESS_TOKEN]
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_TOKEN_KEY)
    req.session.user = data
  } catch (_) {}

  next()
})

app.get('/welcome', (_, res) => res.render('example', { link: TEACHER_LINK, author: TEACHER_NAME }))

app.get('/', (req, res) => {
  const { user } = req.session // middleware
  res.render('auth', user)
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_TOKEN_KEY,
      { expiresIn: '1h' }
    )

    res
      .status(200)
      .cookie(
        ACCESS_TOKEN,
        token,
        {
          httpOnly: true,
          secure: false, // process.env.NODE_ENV === 'PROD',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        }
      )
      .send({ user, message: `User ${username} has been logged in.` })
  } catch (error) {
    errorHandler(res, error)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const id = await UserRepository.create({ username, password })

    res.status(201).json({
      username,
      id,
      message: `User ${username} has been created.`
    })
  } catch (error) {
    errorHandler(res, error)
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie(ACCESS_TOKEN).json({ message: 'Logout successfully.' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized.')

  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}, http://localhost:${PORT}/`)
})
