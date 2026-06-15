import { pool } from "../config/database.js";


export const getOrCreateCart = async (sessionId) => {

  if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
    throw new Error('sessionId es requerido y no puede ser null');
  }
  // Buscar carrito existente
  let [carts] = await pool.query(
    'SELECT * FROM carts WHERE session_id = ?',
    [sessionId]
  );

  if (carts.length === 0) {
    // Crear nuevo carrito
    const [result] = await pool.query(
      'INSERT INTO carts (session_id) VALUES (?)',
      [sessionId]
    );
    return { id: result.insertId, session_id: sessionId };
  }

  return carts[0];
}

export const addItem = async (producto_id, cantidad) => {

    if (!producto_id || !cantidad) {
      throw new Error('Faltan campos requeridos (producto_id, cantidad)');
    }

    try {
        // Verificar si el producto existe y si hay stock suficiente
        const [prodExist] = await pool.query('SELECT stock FROM products WHERE id = ?', [producto_id]);
        if (prodExist.length === 0) {
          throw new Error('El producto no existe');
        }

        if (prodExist[0].stock < cantidad) {
          throw new Error('No hay suficiente stock disponible');
        }

        // Verificar si el producto ya está en el carrito
        const [itemExist] = await pool.query('SELECT id, cantidad FROM carrito WHERE producto_id = ?', [producto_id]);

        if (itemExist.length > 0) {
            // Si ya existe, actualizamos la cantidad sumando la nueva
            const nuevaCantidad = itemExist[0].cantidad + cantidad;
            await pool.query('UPDATE carrito SET cantidad = ? WHERE producto_id = ?', [nuevaCantidad, producto_id]);
        } else {
            // Si no existe, lo insertamos de cero
            await pool.query('INSERT INTO carrito (producto_id, cantidad) VALUES (?, ?)', [producto_id, cantidad]);
        }
    } catch (error) {
      throw new Error(`Error al agregar al carrito, detalles: ${error.message}`);
    }
}

export const getCartItems = async () => {

  const [rows] = await pool.query(`
            SELECT c.id AS carrito_id, p.id AS producto_id, p.name, p.price, c.cantidad, (p.price * c.cantidad) AS subtotal
            FROM carrito c
            JOIN products p ON c.producto_id = p.id`);
  return rows;
}

export const updateItemQuantity = async (producto_id, cantidad) => {
  if (!cantidad || cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    try {
        // Validar si el item existe en el carrito
        const [item] = await pool.query('SELECT producto_id FROM carrito WHERE id = ?', [producto_id]);
        if (item.length === 0) {
          throw new Error('El item no existe en el carrito');
        }

        // Validar stock disponible
        const [prod] = await pool.query('SELECT stock FROM products WHERE id = ?', [item[0].producto_id]);
        if (prod[0].stock < cantidad) {
          throw new Error('No hay suficiente stock disponible para esa cantidad');
        }

        await pool.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, producto_id]);
        return 'Carrito actualizado correctamente';
    } catch (error) {
      throw new Error(`Error al actualizar el carrito, detalle: ${error.message}`);
    }
  
}

export const removeItem = async (producto_id) => {
  try {
        const [result] = await pool.query('DELETE FROM carrito WHERE id = ?', [producto_id]);
        if (result.affectedRows === 0) {
            throw new Error('el item no existe en el carrito');
        }
        return 'Producto eliminado del carrito';
    } catch (error) {
        throw new Error(`Error al eliminar el producto del carrito, detalle: ${error.message}`);
    }
}

export const cleanCart = async () => {
  try {
        await pool.query('DELETE FROM carrito');
        return 'Carrito vaciado por completo';
    } catch (error) {
      throw new Error(`Error al vaciar el carrito, detalle: ${error.message}`);
    }
}

export const totalCarrito = async() => {
  try {

    const productosQuery = `
            SELECT c.id AS carrito_id, p.id AS producto_id, p.name, p.price, c.cantidad, (p.price * c.cantidad) AS subtotal
            FROM carrito c
            JOIN products p ON c.producto_id = p.id
        `;
        const query = `
            SELECT IFNULL(SUM(p.price * c.cantidad), 0) AS total
            FROM carrito c
            JOIN products p ON c.producto_id = p.id
        `;
        
        const [result] = await pool.query(query);
        const [productos] = await pool.query(productosQuery);
        
        return {
          productos: productos,
          total: result[0].total
        } 
    } catch (error) {
       throw new Error(`Error al calcular el total, detalle: ${error.message}`)
    }
}
