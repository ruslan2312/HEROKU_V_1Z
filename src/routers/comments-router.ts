import {Request, Response, Router} from "express";
import {commentsService} from "../service/comments-service";
import {authTokenMW} from "../middleware/authorization-middleware";
import {CommentsResponseType} from "../types/commentsType";
import {commentsContentValidation} from "../common/validator";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {CommentsPaginationData} from "../common/blogPaginationData";
import {postsService} from "../service/posts-service";
import {PaginationResultType} from "../helpers/paginathion";
import {postsRouter} from "./posts-router";
import {GetAuthTokenMW} from "../middleware/Getauthorization-middleware";

export const commentsRouter = Router()

commentsRouter.get('/:commentId', GetAuthTokenMW, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const comment: CommentsResponseType | null = await commentsService.findCommentsByID(req.params.commentId, userId)
        if (comment) {
            res.status(200).send(comment)
        } else {
            res.send(404)
        }
    } catch (e) {
        console.log('eroor')
        const comment: CommentsResponseType | null = await commentsService.findCommentsByID(req.params.commentId, 0)
        if (comment) {
            return res.status(200).send(comment)
        } else {
            return res.send(404)
        }
    }

})
commentsRouter.put('/:commentId', authTokenMW, commentsContentValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.commentId
    const userId = req!.user!.id
    const content = req.body.content
    const comment = await commentsService.findCommentsByID(commentId, userId)
    if (!comment) return res.sendStatus(404)
    if (comment.userId !== userId) return res.sendStatus(403)
    await commentsService.updateComment(commentId, content, userId)
    return res.sendStatus(204)
})
commentsRouter.delete('/:commentId', authTokenMW, async (req: Request, res: Response) => {
    const userId = req!.user!.id
    const commentId = req.params.commentId
    const comment = await commentsService.findCommentsByID(commentId, 0)
    if (!comment) return res.sendStatus(404)
    if (comment.userId !== userId) return res.sendStatus(403)
    await commentsService.deleteComment(commentId)
    return res.sendStatus(204)
})
commentsRouter.put('/:commentId/like-status', authTokenMW, inputValidationMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.commentId
    const userId = req!.user!.id
    const likeStatus = req.body.likeStatus
    const comment = await commentsService.findCommentsByID(commentId, userId)
    if (!comment) return res.sendStatus(404)
    if (comment.userId !== userId) return res.sendStatus(403)
    const like = await commentsService.createLikeByComment(commentId, userId, likeStatus)
    return res.send(like).status(204)
})

postsRouter.get('/:postId/comments', GetAuthTokenMW, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const postId = req.params.postId
        const queryData = CommentsPaginationData(req.query)
        const post = await postsService.findPostByID(postId)
        if (!post) return res.sendStatus(404)
        const findCommentsByPostId: PaginationResultType | null = await commentsService.findCommentsByPostId(queryData, req.params.postId, userId)
        res.status(200).send(findCommentsByPostId)
    } catch (e) {
        const postId = req.params.postId
        const queryData = CommentsPaginationData(req.query)
        const post = await postsService.findPostByID(postId)
        if (!post) return res.sendStatus(404)
        const findCommentsByPostId: PaginationResultType | null = await commentsService.findCommentsByPostId(queryData, req.params.postId, 0)
        res.status(200).send(findCommentsByPostId)
    }



})


postsRouter.post('/:postId/comments', authTokenMW, commentsContentValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    try {
        const content = req.body.content
        const postId = req.params.postId
        const user = req.user
        const post = postsService.findPostByID(postId)
        if (!post) return res.sendStatus(404)
        const newComment = await commentsService.createCommentsByPostId(content, postId, user)
        if (newComment) {
            res.status(201).send(newComment);
        } else res.sendStatus(404)

    } catch (error) {
    }
})