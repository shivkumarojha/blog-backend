import { Hono } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
// intiating a blog router
export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

// Middleware for blog router
blogRouter.use('/*', async (c, next) => {
    const authHeader = c.req.header("authorization") || ''
    const token = authHeader.split(" ")[1]
    const user = await verify(token, c.env.JWT_SECRET)
    if (user.id) {
        c.set("jwtPayload", user.id)

        await next()
    } else {
        c.status(403)
        return c.json({
            message: "Unauthorized"
        })
    }
})


// add a blog
blogRouter.post('/', async (c) => {
    const payload = c.get("jwtPayload")
    const body = await c.req.json()
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            published: body.published,
            authorId: payload
        }
    })

    console.log(blog)
    c.status(200)
    return c.json({
        message: "Post created Successfully",
        blog: blog
    })
})

// update blog
blogRouter.put("/", (c) => {
    return c.text("From blog")
})

// get blog using id
blogRouter.get('/:id', (c) => {
    return c.text("From blog id")
})
// get all the blogs
blogRouter.get('/bulk', (c) => {
    return c.text("from Blog bulk")
})
