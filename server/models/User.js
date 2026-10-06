import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

const mapUser = (row, includePasswordHash = false) => {
  if (!row) return null;

  const user = {
    _id: row.id,
    name: row.name,
    email: row.email,
    codingBelts: JSON.parse(row.coding_belts),
    communicationScore: row.communication_score,
    attendance: JSON.parse(row.attendance),
    vivaScore: row.viva_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includePasswordHash) user.passwordHash = row.password_hash;
  return user;
};

class User {
  static findById(id) {
    const row = getDB().prepare('SELECT * FROM users WHERE id = ?').get(id);
    return mapUser(row);
  }

  static findByEmail(email) {
    const row = getDB().prepare('SELECT * FROM users WHERE email = ?').get(email);
    return mapUser(row, true);
  }

  static create({ name, email, passwordHash }) {
    const result = getDB().prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(name.trim(), email.trim(), passwordHash);
    return this.findById(result.lastInsertRowid);
  }

  static updateProfile(id, updates) {
    const user = this.findById(id);
    if (!user) return null;

    const codingBelts = { ...user.codingBelts, ...updates.codingBelts };
    const attendance = { ...user.attendance, ...updates.attendance };
    const communicationScore = updates.communicationScore ?? user.communicationScore;
    const vivaScore = updates.vivaScore ?? user.vivaScore;

    getDB().prepare(`
      UPDATE users
      SET coding_belts = ?, attendance = ?, communication_score = ?, viva_score = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(codingBelts), JSON.stringify(attendance), communicationScore, vivaScore, id);
    return this.findById(id);
  }

  static async matchPassword(user, enteredPassword) {
    return bcrypt.compare(enteredPassword, user.passwordHash);
  }
}

export default User;
