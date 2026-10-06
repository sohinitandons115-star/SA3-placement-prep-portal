import { getDB } from '../config/db.js';

const columns = `
  id AS _id,
  title,
  category,
  link,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

class Resource {
  static findAll() {
    return getDB().prepare(`SELECT ${columns} FROM resources ORDER BY created_at DESC`).all();
  }

  static findById(id) {
    return getDB().prepare(`SELECT ${columns} FROM resources WHERE id = ?`).get(id);
  }

  static create({ title, category, link }) {
    const result = getDB().prepare(`
      INSERT INTO resources (title, category, link) VALUES (?, ?, ?)
    `).run(title.trim(), category || 'DSA', link.trim());
    return this.findById(result.lastInsertRowid);
  }

  static delete(id) {
    return getDB().prepare('DELETE FROM resources WHERE id = ?').run(id).changes > 0;
  }
}

export default Resource;
