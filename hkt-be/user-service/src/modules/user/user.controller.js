import * as userService from './user.service.js';

export async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    return res.json(updatedUser);
  } catch (err) {
    return next(err);
  }
}
