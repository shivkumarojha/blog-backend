import { Hono } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput } from "@shivkumarojha/medium-common1.0";
// intiating a blog router
export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

// Middleware for blog router
blogRouter.use('*', async (c, next) => {
    const authHeader = c.req.header("authorization") || ''
    const token = authHeader.split(" ")[1]
    try {

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
    } catch (error) {
        c.status(403)
        return c.json({
            message: error,
            error: error
        })
    }
})


// add a blog
blogRouter.post('/', async (c) => {
    const payload = c.get("jwtPayload")
    const body = await c.req.json()
    const parsedData = createBlogInput.safeParse(body)

    if (!parsedData.success) {
        return c.json({
            message: "Invalid sign up input",
            error: parsedData.error
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try {

        const blog = await prisma.post.create({
            data: {
                title: parsedData.data.title,
                content: parsedData.data.content,
                published: parsedData.data.published,
                authorId: payload
            }
        })

        console.log(blog)
        c.status(200)
        return c.json({
            message: "Post created Successfully",
            blog: blog
        })
    } catch (error) {
        c.json({
            message: "some error occured",
            error: error
        })
    }
})

// update blog
blogRouter.put("/:id", async (c) => {
    const body = await c.req.json()
    const blogId = c.req.param('id')
    const parsedData = createBlogInput.partial().safeParse(body)
    if (!parsedData.success) {
        return c.json({
            message: "Invalid sign up input",
            error: parsedData.error
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {

        // update title and body
        const updatedBlog = await prisma.post.update({
            where: {
                id: blogId
            },
            data: {
                title: parsedData.data.title,
                content: parsedData.data.content
            }
        })
        if (!updatedBlog) {
            return c.json({
                message: "invalid post id"
            })
        }
        return c.json({
            message: "Post updated Successfully",
            blog: updatedBlog
        })
    } catch (error) {
        return c.json({
            message: "Some error occured",
            error: error
        })
    }
})


// get blog using id
blogRouter.get('/:id', async (c) => {
    const blogId = c.req.param('id')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {

        // Find the specific blog
        const blog = await prisma.post.findUnique({
            where: {
                id: blogId
            },
            include: {
                author: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        })

        if (!blog) {
            c.status(404)
            return c.json({
                message: "Not found"
            })
        }

        return c.json({
            message: "Blog fetched Successfully",
            blog: blog
        })
    } catch (error) {
        return c.json({
            message: "Some error occured",
            error: error
        })
    }
})
// get all the blogs: TODO - add pagination
blogRouter.get('/post/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blogs = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        email: true,
                        name: true
                    }
                }

            }
        })
        return c.json({
            message: "Successfully fetched blogs",
            blogs: blogs

        })
    } catch (error) {
        return c.json({
            message: "Some error occured",
            error: error
        })
    }
})
