import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {mwBasicAuth} from "../middleware/MwBasic";
import {blogsService} from "../service/blogs-service";
import {BlogsType} from "../types/blogsType";
import {PostsType} from "../types/postsType";
import {findPostByIdTypePaginationData, BlogPaginationData} from "../common/blogPaginationData";
import {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogNameValidation,
    nameValidation,
    websiteUrlValidation
} from "../common/validator";
import {GetAuthTokenMW} from "../middleware/Getauthorization-middleware";

export const blogsRouter = Router()

blogsRouter.get('/', async (req: Request, res: Response) => {
    const queryData = BlogPaginationData(req.query);
    const findBlogs: BlogsType[] = await blogsService.findBlog(queryData);
    res.status(200).send(findBlogs)
})
blogsRouter.get('/:id',
    async (req: Request, res: Response) => {
        let blog: BlogsType | null = await blogsService.findBlogByID(req.params.id)
        if (blog) {
            res.status(200).send(blog)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.get('/:blogId/posts', GetAuthTokenMW,
    async (req: Request, res: Response) => {
        try {
            const userId = req.user.id
            const queryData = findPostByIdTypePaginationData(req.query)
            const post: PostsType[] = await blogsService.findBlogAndPostByID(queryData, req.params.blogId, userId)
            if (post) {
                res.status(200).send(post)
            } else {
                res.sendStatus(404)
            }
        } catch (e) {
            const queryData = findPostByIdTypePaginationData(req.query)
            const post: PostsType[] = await blogsService.findBlogAndPostByID(queryData, req.params.blogId, '')
            if (post) {
                res.status(200).send(post)
            } else {
                res.sendStatus(404)
            }
        }

    })
blogsRouter.post('/', mwBasicAuth, nameValidation, websiteUrlValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const newBlog: BlogsType = await blogsService.createBlog(req.body.name, req.body.websiteUrl, req.body.description)
    res.status(201).send(newBlog)
})
blogsRouter.post('/:blogId/posts', mwBasicAuth, titleValidation, shortDescriptionValidation, contentValidation,
    blogNameValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
        const newPost: PostsType | null = await blogsService.createPostByBlog(req.params.blogId, req.body.title, req.body.shortDescription, req.body.content)
        if (newPost) {
            res.status(201).send(newPost)
        }
        res.status(404).send()
    })
blogsRouter.put('/:id', mwBasicAuth, nameValidation, websiteUrlValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const isUpdate: boolean = await blogsService.updateBlog(req.params.id, req.body.name, req.body.websiteUrl)
    if (isUpdate) {
        const blog = await blogsService.findBlogByID(req.params.id)
        res.status(204).send(blog)
    } else {
        res.sendStatus(404)
    }
})
blogsRouter.delete('/:id', mwBasicAuth, async (req: Request, res: Response) => {
    const deleteBlog = await blogsService.deleteBlog(req.params.id)
    if (deleteBlog) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})


