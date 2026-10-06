import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

const mapUser = (row, includePasswordHash = false) => {
  if (!row) return null;

  const user = {
    _id: Number(row.id),
    name: row.name,
    email: row.email,
    codingBelts: row.coding_belts,
    communicationScore: row.communication_score,
    attendance: row.attendance,
    vivaScore: row.viva_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includePasswordHash) user.passwordHash = row.password_hash;
  return user;
};

class User {
  static async findById(id) {
    const { rows } = await getDB().query('SELECT * FROM users WHERE id = $1', [id]);
    return mapUser(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await getDB().query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return mapUser(rows[0], true);
  }

  static async create({ name, email, passwordHash }) {
    const { rows } = await getDB().query(`
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name.trim(), email.trim().toLowerCase(), passwordHash]);
    return mapUser(rows[0]);
  }

  static async updateProfile(id, updates) {
    const user = await this.findById(id);
    if (!user) return null;

    const codingBelts = { ...user.codingBelts, ...updates.codingBelts };
    const attendance = { ...user.attendance, ...updates.attendance };
    const communicationScore = updates.communicationScore ?? user.communicationScore;
    const vivaScore = updates.vivaScore ?? user.vivaScore;

    const { rows } = await getDB().query(`
      UPDATE users
      SET coding_belts = $1, attendance = $2, communication_score = $3,
          viva_score = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [codingBelts, attendance, communicationScore, vivaScore, id]);
    return mapUser(rows[0]);
  }

  static async matchPassword(user, enteredPassword) {
    return bcrypt.compare(enteredPassword, user.passwordHash);
  }
}

export default User;
