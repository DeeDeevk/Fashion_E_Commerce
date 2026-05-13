const addressService = require("../services/addressService");

const getAddress = async (req, res, next) => {
  try {
    const result = await addressService.getAddressByAccountId(
      req.params.accountId,
    );
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const result = await addressService.saveAddress(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const result = await addressService.updateAddress(req.body);
    res.json({ code: 1000, message: "Success", result });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Attempting to delete address ID:", id);
    await addressService.deleteAddress(id);
    res.status(204).send(); // noContent
  } catch (err) {
    next(err);
  }
};

module.exports = { getAddress, addAddress, updateAddress, deleteAddress };
