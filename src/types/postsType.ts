export type PostsType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string;
}
export type PostPaginationQueryType = {
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}
export type FindPostByIdPaginationQueryType = {
    blogId: string,
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}