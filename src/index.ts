import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

app.use('/api/*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// user Router
import { userRouter } from './routes/user'
app.route("/api/v1/user", userRouter)

// blog router
import { blogRouter } from './routes/blog'
app.route('/api/v1/blog', blogRouter)



export default app
