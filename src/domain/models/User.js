// src/domain/models/User.js
export class User {
  constructor({ uid, name, cedula, email, role }) {
    this.uid = uid;
    this.name = name;
    this.cedula = cedula;
    this.email = email;
    this.role = role;
  }
}
