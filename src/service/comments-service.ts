import {commentsRepository} from "../repository/comments-repository";
import {CommentsPaginationQueryType, CommentsResponseType, CommentsType} from "../types/commentsType";
import {UserType} from "../types/usersType";
import {postsRepository} from "../repository/posts-repository";
import {PaginationResultType} from "../helpers/paginathion";

export const commentsService = {
    async findCommentsByID(id: string, userId: string | number): Promise<CommentsResponseType | null> {
        const comment = await commentsRepository.findCommentsByID(id, userId)
        if (!comment) return null
        return comment
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
    async findCommentsByPostId(queryData: CommentsPaginationQueryType, postId: string, userId: string | number): Promise<PaginationResultType | null> {
        const post = await postsRepository.findPostByID(postId)
        if (post) {
            return await commentsRepository.findCommentsByPostId(queryData, postId,userId)
        } else return null
    },
    async createCommentsByPostId(content: string, postId: string, user: UserType): Promise<CommentsResponseType | null> {
        const post = await postsRepository.findPostByID(postId)
        if (!post) return null
        const id = (+new Date()).toString()
        const newComment: CommentsType = {
            id,
            content,
            userId: user.id,
            userLogin: user.login,
            parentId: postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None",
            },
            createdAt: new Date().toISOString()
        }
        await commentsRepository.createComment({...newComment})
        const result = this.transformDbTypeToResponseTypeForCreate(newComment, user)
        return result

    },
    transformDbTypeToResponseTypeForCreate(comment: CommentsType, user: UserType): CommentsResponseType {
        return {
            id: comment.id,
            content: comment.content,
            userId: user.id,
            userLogin: user.login,
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: comment.likesInfo.myStatus
            },
            createdAt: comment.createdAt
        }
    },
    transformDbTypeToResponseTypeForFindOne(comment: CommentsType): CommentsResponseType {
        return {
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            userLogin: comment.userLogin,
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: comment.likesInfo.myStatus
            },
            createdAt: comment.createdAt
        }
    },
    async createLikeByComment(commentId: string, userId: string, likeStatus: string) {
        const comment = commentsRepository.findCommentsByID(commentId, userId)
        if (!comment) return null
        return await commentsRepository.createLikeByComment(commentId, userId, likeStatus)
    }
}


