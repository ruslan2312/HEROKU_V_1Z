import {commentsRepository} from "../repository/comments-repository";
import {CommentsPaginationQueryType, CommentsResponseType, CommentsType} from "../types/commentsType";
import {UserType} from "../types/usersType";
import {postsRepository} from "../repository/posts-repository";
import {PaginationResultType} from "../helpers/paginathion";

export const commentsService = {
    async findCommentsByID(id: string): Promise<CommentsResponseType | null> {
        const comment = await commentsRepository.findCommentsByID(id)
        if (!comment) return null
        return this.transformDbTypeToResponseTypeForFindOne(comment)
    },
    async updateComment(commentId: string, content: string, userId: string): Promise<boolean | null> {
        return commentsRepository.updateComments(commentId, content, userId)
    },
    async deleteComment(id: string): Promise<boolean | null> {
        return commentsRepository.deleteComment(id)
    },
    async deleteAllComments() {
        return commentsRepository.deleteAllComments()
    },
    async findCommentsByPostId(queryData: CommentsPaginationQueryType, postId: string): Promise<PaginationResultType | null> {
        const post = await postsRepository.findPostByID(postId)
        if (post) {
            return await commentsRepository.findCommentsByPostId(queryData, postId)
        } else return null
    },
    async createCommentsByPostId(content: string, postId: string, user: UserType): Promise<CommentsResponseType | null> {
        const post = await postsRepository.findPostByID(postId)
        if (!post) return null
        const id = (+new Date()).toString()
        const newComment = {
            id,
            content,
            userId: user.id,
            userLogin: user.login,
            parentId: postId,
            createdAt: new Date().toISOString()
        }
        await commentsRepository.createComment({...newComment})
        const result = this.transformDbTypeToResponseTypeForCreate(newComment, user)
        return result

    },
    transformDbTypeToResponseTypeForCreate(comment: CommentsType, user: UserType):CommentsResponseType {
        return {
            id: comment.id,
            content: comment.content,
            userId: user.id,
            userLogin: user.login,
            createdAt: comment.createdAt
        }
    },
    transformDbTypeToResponseTypeForFindOne(comment: CommentsType):CommentsResponseType {
        return {
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            userLogin: comment.userLogin,
            createdAt: comment.createdAt
        }
    },
}


