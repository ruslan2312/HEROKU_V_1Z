import {CommentsPaginationQueryType, CommentsType} from "../types/commentsType";
import {CommentsCollection} from "./db";
import {Filter} from "mongodb";
import {PaginationResultType} from "../helpers/paginathion";

export const comments: CommentsType[] = []

export const commentsRepository = {
    async findCommentsByID(id: string): Promise<CommentsType | null> {
        return await CommentsCollection.findOne({id: id}, {projection: {_id: 0}});
    },
    async updateComments(commentId: string, content: string, userId: string): Promise<boolean | null> {
        try {
            const result = await CommentsCollection.updateOne({id: commentId, userId}, {$set: {content}})
            return result.modifiedCount === 1
        } catch (e) {
            return null
        }
    },
    async deleteComment(id: string): Promise<boolean | null> {
        try {
            const result = await CommentsCollection.deleteOne({id})
            return result.deletedCount === 1
        } catch (error) {
            return null
        }
    },
    async deleteAllComments() {
        return CommentsCollection.deleteMany({})
    },
    async findCommentsByPostId(queryData: CommentsPaginationQueryType, postId: string): Promise<PaginationResultType | null> {
        const filter: Filter<CommentsType> = {parentId: postId}
        const totalCount = await CommentsCollection.countDocuments(filter);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await CommentsCollection.find(filter,
            {projection: {_id: 0, parentId: 0}}).sort(queryData.sortBy, queryData.sortDirection)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        return ({pagesCount, page, pageSize, totalCount, items,})
    }
    ,
    async createComment(newComment: CommentsType): Promise<boolean | null> {
        try {
            // return CommentsCollection.insertOne(newComment);
            const createdComment = await CommentsCollection.insertOne({...newComment});
            if (!createdComment) return null
            return createdComment.acknowledged
        } catch (e) {
            return null
        }
    },
}