import { UserResponseType} from "../types/usersType";
import {PostsResponseType} from "../types/postsType"
import {BlogsResponseType} from "../types/blogsType"
import {CommentsResponseType} from "../types/commentsType"

type PaginationItemsType = UserResponseType[] | BlogsResponseType[] | CommentsResponseType[] | PostsResponseType[]

export type PaginationResultType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PaginationItemsType
}

export const paginationResult = (page: number, pageSize: number, totalCount: number, items: PaginationItemsType): PaginationResultType => {
    const pagesCount = Number(Math.ceil(totalCount / pageSize))
    return {pagesCount, page, pageSize, totalCount, items}

}