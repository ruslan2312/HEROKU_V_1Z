import {Request, Response, Router} from "express";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {mwBasicAuth} from "../middleware/MwBasic";
import {postsService} from "../service/posts-service";
import {getPostPaginationData} from "../common/blogPaginationData";
import {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    blogNameValidation, likeStatusValidator
} from "../common/validator";
import {authTokenMW} from "../middleware/authorization-middleware";
import {commentsService} from "../service/comments-service";
import {commentsRouter} from "./comments-router";
import {GetAuthTokenMW} from "../middleware/Getauthorization-middleware";

export const postsRouter = Router()

postsRouter.get('/', GetAuthTokenMW, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const queryData = getPostPaginationData(req.query)
        const findPosts = await postsService.findPosts(queryData, userId)
        res.status(200).send(findPosts)
    } catch (e) {
        const queryData = getPostPaginationData(req.query)
        const findPosts = await postsService.findPosts(queryData, '')
        res.status(200).send(findPosts)
    }
})
postsRouter.get('/:postId', GetAuthTokenMW, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        let postId = req.params.postId
        let post = await postsService.findPostByID(postId, userId)
        if (post) {
            res.status(200).send(post)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        let postId = req.params.postId
        let post = await postsService.findPostByID(postId, '')
        if (post) {
            res.status(200).send(post)
        } else {
            res.sendStatus(404)
        }
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
            const post = await postsService.findPostByID(req.params.id, '')
            res.status(204).send(post)
        } else {
            res.sendStatus(404)
        }
    })
postsRouter.post('/', mwBasicAuth, titleValidation, shortDescriptionValidation, contentValidation,
    blogIdValidation, blogNameValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)
        res.status(201).send(newPost);
    })


postsRouter.put('/:postId/like-status', authTokenMW, likeStatusValidator, inputValidationMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.postId
    const userId = req!.user!.id
    const likeStatus = req.body.likeStatus
    const login = req.user.login
    const comment = await postsService.findPostByID(postId, userId)
    if (!comment) return res.sendStatus(404)
    const like = await postsService.createLikeByPost(postId, userId, likeStatus, login)
    return res.sendStatus(204)
})

/// COMMENTS ==========================================================================================================




