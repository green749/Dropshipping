import { Post, Campaign, SocialAccount } from '../models/index.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';

export const postService = {
  async getAllPosts(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.campaign_id) where.campaign_id = query.campaign_id;
    if (query.social_account_id) where.social_account_id = query.social_account_id;
    if (query.status) where.status = query.status;

    const { count, rows } = await Post.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
        { model: SocialAccount, as: 'socialAccount', attributes: ['id', 'platform', 'account_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return { posts: rows, pagination: formatPagination(page, limit, count) };
  },

  async getPostById(id) {
    const post = await Post.findByPk(id, {
      include: [
        { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
        { model: SocialAccount, as: 'socialAccount', attributes: ['id', 'platform', 'account_name'] },
      ],
    });

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    return post;
  },

  async createPost(data, user) {
    const payload = { ...data };
    if (!payload.campaign_id) delete payload.campaign_id;
    if (!payload.social_account_id) delete payload.social_account_id;
    if (!payload.product_id) delete payload.product_id;
    return Post.create({
      ...payload,
      created_by: user?.id || user?.userId || null,
    });
  },

  async updatePost(id, data) {
    const post = await Post.findByPk(id);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    return post.update(data);
  },

  async deletePost(id) {
    const post = await Post.findByPk(id);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    await post.destroy();
    return true;
  },

  async publishPost(id) {
    const post = await Post.findByPk(id);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    return post.update({
      status: 'PUBLISHED',
      published_at: new Date(),
    });
  },
};
