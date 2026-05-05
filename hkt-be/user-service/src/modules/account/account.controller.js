import * as accountService from './account.service.js';

export async function getMyInfo(req, res, next) {
  try {
    const account = await accountService.getMyInfo(req.user.id);
    return res.json({ result: account });
  } catch (err) {
    return next(err);
  }
}
