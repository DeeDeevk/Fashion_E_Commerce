import * as addressService from './address.service.js';

export async function getAddresses(req, res, next) {
  try {
    const addresses = await addressService.getAddresses(req.params.accountId);
    return res.json({ result: addresses });
  } catch (err) {
    return next(err);
  }
}

export async function addAddress(req, res, next) {
  try {
    // Inject accountId from JWT if not provided in body (security best practice)
    const addressData = { ...req.body, accountId: req.user.id };
    const newAddress = await addressService.addAddress(addressData);
    return res.json({ result: newAddress });
  } catch (err) {
    return next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const updatedAddress = await addressService.updateAddress(req.body);
    return res.json({ result: updatedAddress });
  } catch (err) {
    return next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    await addressService.deleteAddress(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
