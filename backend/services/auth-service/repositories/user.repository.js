import { User } from '../models/User.js';

export const userRepository = {
  async findByEmail(email, includePassword = false) {
    const scope = includePassword ? User.scope('withPassword') : User;
    return scope.findOne({ where: { email } });
  },

  async findById(id) {
    return User.findByPk(id);
  },

  async create(userData) {
    const user = await User.create(userData);
    const plainUser = user.toJSON();
    delete plainUser.password_hash;
    return plainUser;
  },

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(updateData);
    const plainUser = user.toJSON();
    delete plainUser.password_hash;
    return plainUser;
  },
};
