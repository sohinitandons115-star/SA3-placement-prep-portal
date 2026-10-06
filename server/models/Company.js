import { getDB } from '../config/db.js';

const columns = `
  id AS "_id",
  user_id AS "userId",
  name,
  role,
  applied_date AS "appliedDate",
  status,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const mapCompany = (row) => (
  row && {
    ...row,
    _id: Number(row._id),
    userId: Number(row.userId),
  }
);

class Company {
  static async findByUserId(userId) {
    const { rows } = await getDB().query(`
      SELECT ${columns} FROM companies WHERE user_id = $1 ORDER BY applied_date DESC
    `, [userId]);
    return rows.map(mapCompany);
  }

  static async findById(id) {
    const { rows } = await getDB().query(`SELECT ${columns} FROM companies WHERE id = $1`, [id]);
    return mapCompany(rows[0]);
  }

  static async create({ userId, name, role, status, appliedDate }) {
    const { rows } = await getDB().query(`
      INSERT INTO companies (user_id, name, role, status, applied_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${columns}
    `, [userId, name.trim(), role.trim(), status || 'Applied', appliedDate || new Date()]);
    return mapCompany(rows[0]);
  }

  static async update(id, updates) {
    const allowedFields = {
      name: 'name',
      role: 'role',
      status: 'status',
      appliedDate: 'applied_date',
    };
    const entries = Object.entries(updates)
      .filter(([key, value]) => allowedFields[key] && value !== undefined && value !== '');

    if (entries.length === 0) return this.findById(id);

    const values = entries.map(([, value]) => value);
    const assignments = entries.map(([key], index) => `${allowedFields[key]} = $${index + 1}`);
    values.push(id);
    assignments.push(`updated_at = NOW()`);

    const { rows } = await getDB().query(`
      UPDATE companies
      SET ${assignments.join(', ')}
      WHERE id = $${values.length}
      RETURNING ${columns}
    `, values);
    return mapCompany(rows[0]);
  }

  static async delete(id) {
    const result = await getDB().query('DELETE FROM companies WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

export default Company;
