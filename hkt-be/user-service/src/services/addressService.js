const { Address, Account } = require("../entities");

const getAddressByAccountId = async (accountId) => {
  const account = await Account.findByPk(accountId);
  if (!account) {
    const err = new Error("Account not found");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  const addresses = await Address.findAll({
    where: { account_id: accountId },
  });

  return addresses.map(toAddressResponse);
};

const saveAddress = async (addressRequest) => {
  const account = await Account.findByPk(addressRequest.accountId);
  if (!account) {
    const err = new Error("Account not found");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  const address = await Address.create({
    account_id: addressRequest.accountId,
    province: addressRequest.province,
    delivery_address: addressRequest.delivery_address,
    delivery_note: addressRequest.delivery_note,
  });

  return toAddressResponse(address);
};

const updateAddress = async (addressRequest) => {
  const address = await Address.findByPk(addressRequest.id);
  if (!address) {
    const err = new Error("Address not found");
    err.code = "ADDRESS_NOT_FOUND";
    throw err;
  }

  await address.update({
    province: addressRequest.province,
    delivery_address: addressRequest.delivery_address,
    delivery_note: addressRequest.delivery_note,
  });

  return toAddressResponse(address);
};

const deleteAddress = async (id) => {
  const address = await Address.findByPk(id);
  if (!address) {
    const err = new Error("Address not found");
    err.code = "ADDRESS_NOT_FOUND";
    throw err;
  }

  await address.destroy();
};

// mapper nhỏ thay cho AddressMapper.java
const toAddressResponse = (address) => ({
  id: address.id,
  province: address.province,
  delivery_address: address.delivery_address,
  delivery_note: address.delivery_note,
});

module.exports = {
  getAddressByAccountId,
  saveAddress,
  updateAddress,
  deleteAddress,
};
