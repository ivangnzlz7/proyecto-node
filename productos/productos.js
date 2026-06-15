import { pool } from "../config/database.js";

// Funciones para productos
export const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  return rows;
}

export const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

export const create = async (productData) => {
  const { name, category, price, stock } = productData;
  const [result] = await pool.query(
    'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
    [name, category, price, stock]
  );
  return getById(result.insertId);
}

export const deleteProduct = async (id) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export const validarStock = async(id,quantity) => {
  const stock = await pool.query('SELECT stock FROM products WHERE id = ?', [id]);
  return stock[0];
}
