import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {mwBasicAuth} from "../middleware/MwBasic";
import {postsService} from "../service/posts-service";
import {CommentsPaginationData, getPostPaginationData} from "../common/blogPaginationData";
import {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    blogNameValidation, commentsContentValidation
} from "../common/validator";
import {authTokenMW} from "../middleware/authorization-middleware";
import {commentsService} from "../service/comments-service";
import {PaginationResultType} from "../helpers/paginathion";

export const postsRouter = Router()
postsRouter.get('/', async (req: Request, res: Response) => {
    const queryData = getPostPaginationData(req.query)
    const findPosts = await postsService.findPosts(queryData)
    res.status(200).send(findPosts)
})
postsRouter.get('/:id',
    async (req: Request, res: Response) => {
        let video = await postsService.findPostByID(req.params.id)
        if (video) {
            res.status(200).send(video)
        } else {
            res.sendStatus(404)
        }
    })
postsRouter.delete('/:id', mwBasicAuth, async (req: Request, res: Response) => {
    const deletePost = await postsService.deletePost(req.params.id)
    if (deletePost) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})
postsRouter.put('/:id', mwBasicAuth, titleValidation, shortDescriptionValidation, contentValidation,
    blogIdValidation, blogNameValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
        const isUpdate = await postsService.updatePost(req.params.id, req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)
        if (isUpdate) {
            const post = await postsService.findPostByID(req.params.id)
            res.status(204).send(post)
        } else {
            res.sendStatus(404)
        }
    })
postsRouter.post('/', mwBasicAuth, titleValidation, shortDescriptionValidation, contentValidation,
    blogIdValidation, blogNameValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)
        console.log(newPost)
        res.status(201).send(newPost);
    })

/// COMMENTS ==========================================================================================================
postsRouter.get('/:postId/comments', async (req: Request, res: Response) => {
    const postId = req.params.postId
    const queryData = CommentsPaginationData(req.query)
    const post = await postsService.findPostByID(postId)
    if (!post) return  res.sendStatus(404)
    const findCommentsByPostId: PaginationResultType | null = await commentsService.findCommentsByPostId(queryData, req.params.postId)
    res.status(200).send(findCommentsByPostId)
})
postsRouter.post('/:postId/comments', authTokenMW, commentsContentValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    try {
        const content = req.body.content
        const postId = req.params.postId
        const user = req.user
        const post = postsService.findPostByID(postId)
        if (!post) return  res.sendStatus(404)
        const newComment = await commentsService.createCommentsByPostId(content, postId, user)
        if (newComment) {
            res.status(201).send(newComment);
        } else res.sendStatus(404)

    } catch (error) {
    }
})



