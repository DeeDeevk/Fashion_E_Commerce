export default class User {
  constructor({ id, email, fullName, phone, address, ...rest }) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.phone = phone;
    this.address = address;
    Object.assign(this, rest);
  }
}
