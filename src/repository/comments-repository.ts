import {CommentsPaginationQueryType, CommentsType} from "../types/commentsType";
import {CommentsModel} from "./db";
import {Filter} from "mongodb";
import {PaginationResultType} from "../helpers/paginathion";

export const comments: CommentsType[] = []

export const commentsRepository = {
    async findCommentsByID(id: string): Promise<CommentsType | null> {
        return CommentsModel.findOne({id: id}, {projection: {_id: 0}});
    },
    async updateComments(commentId: string, content: string, userId: string): Promise<boolean | null> {
        try {
            const result = await CommentsModel.updateOne({id: commentId, userId}, {$set: {content}})
            return result.modifiedCount === 1
        } catch (e) {
            return null
        }
    },
    async deleteComment(id: string): Promise<boolean | null> {
        try {
            const result = await CommentsModel.deleteOne({id})
            return result.deletedCount === 1
        } catch (error) {
            return null
        }
    },
    async deleteAllComments() {
        return CommentsModel.deleteMany({})
    },
    async findCommentsByPostId(queryData: CommentsPaginationQueryType, postId: string): Promise<PaginationResultType | null> {
        const filter: Filter<CommentsType> = {parentId: postId}
        const totalCount = await CommentsModel.countDocuments({filter});
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await CommentsModel.find({filter},
            {projection: {_id: 0, parentId: 0}}).sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean() as []
        return ({pagesCount, page, pageSize, totalCount, items,})
    }
    ,
    async createComment(newComment: CommentsType): Promise<boolean | null> {
        try {
            const createdComment = await CommentsModel.insertMany([newComment]);
            if (!createdComment) return null
            return true
        } catch (e) {
            return null
        }
    },
}