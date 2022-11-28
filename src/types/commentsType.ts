import mongoose from "mongoose";

export type CommentsResponseType = {
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string
}
export type CommentsType = {
    id: string,
    parentId: string
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string
}
export type  CommentsPaginationQueryType = {
    content?: string
    postId: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}

export const newCommentsScheme = new mongoose.Schema({
    id: String,
    parentId: String,
    content: String,
    userId: String,
    userLogin: String,
    createdAt: String
})
