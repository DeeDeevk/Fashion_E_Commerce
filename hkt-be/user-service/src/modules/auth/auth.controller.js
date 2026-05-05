import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const newUser = await authService.register(req.body);
    return res.status(201).json({ result: newUser });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    // Return structure expected by FE: result: { token: '...' }
    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return res.json({ result: 'Password reset successfully' });
  } catch (err) {
    return next(err);
  }
}
