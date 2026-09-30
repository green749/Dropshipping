import { postService } from '../services/post.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const postController = {
  async getAll(req, res, next) {
    try {
      const { posts, pagination } = await postService.getAllPosts(req.query);
      return sendSuccess(res, 'Posts retrieved successfully', posts, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      return sendSuccess(res, 'Post details retrieved successfully', post);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const post = await postService.createPost(req.body, req.user);
      return sendSuccess(res, 'Post created successfully', post, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const post = await postService.updatePost(req.params.id, req.body);
      return sendSuccess(res, 'Post updated successfully', post);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await postService.deletePost(req.params.id);
      return sendSuccess(res, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async publish(req, res, next) {
    try {
      const post = await postService.publishPost(req.params.id);
      return sendSuccess(res, 'Post published successfully', post);
    } catch (error) {
      next(error);
    }
  },
};
