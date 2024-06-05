import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// POST / api / v1 / user / signup
app.post('api/v1/user/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const user = await c.req.json()

  await prisma.user.create({
    data: {
      email: user.email,
      name: user.name,
      password: user.password
    }
  })
  console.log("hello", user)
  return c.text("From signup")
})

// POST / api / v1 / user / signin
app.post('api/v1/user/signin', async (c) => {
  const { email, password } = await c.req.json()

  // initializing prisma
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const isUser = await prisma.user.findUnique({
    where: {
      email: email
    },
    select: {
      id: true,
      password: true
    }
  })
  if (!isUser) {
    c.json({
      message: "email doesn't exist, Kindly sign up"
    })
  }
  if (password !== isUser?.password) {
    c.json({
      message: "Password didn't matched"
    })
  }
  const token = await sign({ id: isUser?.id, email: email }, c.env.JWT_SECRET)
  c.status(200)
  return c.json({
    message: "Successfully logged in",
    token: token
  })


  // return c.text("From Sign in")
})

// POST / api / v1 / blog
app.post('/api/v1/blog', (c) => {
  return c.text("From blog")
})

// PUT / api / v1 / blog
app.put("/api/v1/blog", (c) => {
  return c.text("From blog")
})

// GET / api / v1 / blog /: id
app.get('/api/v1/blog/:id', (c) => {
  return c.text("From blog id")
})
// GET / api / v1 / blog / bulk
app.get('/api/v1/blog/bulk', (c) => {
  return c.text("from Blog bulk")
})


export default app
