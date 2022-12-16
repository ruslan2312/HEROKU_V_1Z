import {postsRepository} from "../repository/posts-repository";
import {
    NewestLikesType,
    PostPaginationQueryType,
    PostsType,
} from "../types/postsType";
import {blogsService} from "./blogs-service";
import {PaginationResultType} from "../helpers/paginathion";
import {CommentsModel, LikesModel, PostsModel} from "../repository/db";
import any = jasmine.any;
import {postsRouter} from "../routers/posts-router";

export const postsService = {
    async findPosts(query: PostPaginationQueryType, userId: string | null): Promise<PaginationResultType> {
        return  postsRepository.findPosts(query, userId)
    },
    async findPostByID(postId: string, userId: string | null): Promise<PostsType | null> {
        const post = await postsRepository.findPostByID(postId)
        if (!post) return null
        const like = await LikesModel.findOne({userId: userId, parentId: postId})
        const newestLikes: NewestLikesType[] = await LikesModel
            .find({ parentId: postId, status: 'Like'}, {_id: 0, userId: 1, login: 1, addedAt: '$createdAt'})
            .limit(3)
            .lean()

        if (like) {
            post.extendedLikesInfo.myStatus = like.status!
        }

       post.extendedLikesInfo.newestLikes = newestLikes

// В лайке создать логин
        return post
    },
    async deletePost(id: string): Promise<boolean> {
        return await postsRepository.deletePost(id)
    },
    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        return await postsRepository.updatePost(id, title, shortDescription, content, blogId)
    },
    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostsType | null> {
        const blogger = await blogsService.findBlogByID(blogId)
        if (!blogger) return null
        //Поработать над созданием поста??
        if (blogger) {
            const newPost: PostsType = {
                id: new Date().valueOf().toString(),
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: blogger.name,
                createdAt: new Date().toISOString(),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: []
                }
            }
            await postsRepository.createPost({...newPost})
            return newPost
        }
        return null
    },
    async deleteAllPosts(): Promise<boolean> {
        return postsRepository.deleteAllPosts()
    },

    async createLikeByPost(postId: string, userId: any, likeStatus: string, login: string) {
        const createdAt = new Date().toISOString()
        return postsRepository.createLikeByPost(postId, userId, likeStatus, login, createdAt)
    }
}
