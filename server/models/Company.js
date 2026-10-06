import { getDB } from '../config/db.js';

const columns = `
  id AS _id,
  user_id AS userId,
  name,
  role,
  applied_date AS appliedDate,
  status,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

class Company {
  static findByUserId(userId) {
    return getDB().prepare(`
      SELECT ${columns} FROM companies WHERE user_id = ? ORDER BY applied_date DESC
    `).all(userId);
  }

  static findById(id) {
    return getDB().prepare(`SELECT ${columns} FROM companies WHERE id = ?`).get(id);
  }

  static create({ userId, name, role, status, appliedDate }) {
    const result = getDB().prepare(`
      INSERT INTO companies (user_id, name, role, status, applied_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, name.trim(), role.trim(), status || 'Applied', new Date(appliedDate).toISOString());
    return this.findById(result.lastInsertRowid);
  }

  static update(id, updates) {
    const allowedFields = {
      name: 'name',
      role: 'role',
      status: 'status',
      appliedDate: 'applied_date',
    };
    const entries = Object.entries(updates)
      .filter(([key, value]) => allowedFields[key] && value !== undefined && value !== '');

    if (entries.length === 0) return this.findById(id);

    const assignments = entries.map(([key]) => `${allowedFields[key]} = ?`);
    const values = entries.map(([key, value]) => (
      key === 'appliedDate' ? new Date(value).toISOString() : value
    ));
    assignments.push('updated_at = CURRENT_TIMESTAMP');
    getDB().prepare(`UPDATE companies SET ${assignments.join(', ')} WHERE id = ?`).run(...values, id);
    return this.findById(id);
  }

  static delete(id) {
    return getDB().prepare('DELETE FROM companies WHERE id = ?').run(id).changes > 0;
  }
}

export default Company;
