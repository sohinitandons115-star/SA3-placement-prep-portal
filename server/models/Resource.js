import { getDB } from '../config/db.js';

const columns = `
  id AS "_id",
  title,
  category,
  link,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const mapResource = (row) => row && { ...row, _id: Number(row._id) };

class Resource {
  static async findAll() {
    const { rows } = await getDB().query(`SELECT ${columns} FROM resources ORDER BY created_at DESC`);
    return rows.map(mapResource);
  }

  static async findById(id) {
    const { rows } = await getDB().query(`SELECT ${columns} FROM resources WHERE id = $1`, [id]);
    return mapResource(rows[0]);
  }

  static async create({ title, category, link }) {
    const { rows } = await getDB().query(`
      INSERT INTO resources (title, category, link)
      VALUES ($1, $2, $3)
      RETURNING ${columns}
    `, [title.trim(), category || 'DSA', link.trim()]);
    return mapResource(rows[0]);
  }

  static async delete(id) {
    const result = await getDB().query('DELETE FROM resources WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

export default Resource;
