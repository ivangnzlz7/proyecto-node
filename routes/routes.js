import express from 'express';
import { getAll } from '../productos/productos.js';
import {
  getCartItems,
  getOrCreateCart,
  addItem,
  updateItemQuantity,
  removeItem,
  cleanCart,
  totalCarrito
} from '../carrito/carritoStorage.js';
import crypto from 'crypto';

const routes = express.Router();

routes.get('/products', async (req, res) => {
  try {
    const products = await getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})


routes.get('/carrito', async (req, res) => {
  try {
    const cart = await getCartItems();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.post('/carrito/agregar/:productoId', async (req, res) => {
  try {
    const { cantidad } = req.body;
    let { productoId } = req.params;

    if (!productoId || cantidad < 1) {
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }

    // Convertir en numero con parseInt
    let productoIdNum = parseInt(productoId);

    const cart = await addItem(productoIdNum, cantidad);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.put('/carrito/actualizar/:productoId', async (req, res) => {
  try {
    const { cantidad } = req.body;
    const { productoId } = req.params;

    const cart = await updateItemQuantity(productoId, cantidad);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.delete('/carrito/eliminar/:productoId', async (req, res) => {
  try {
    const { productoId } = req.params;
    let productIdNum = parseInt(productoId);

    const cart = await removeItem(productIdNum);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.post('/carrito/vaciar', async (req, res) => {
  try {

    const cart = await cleanCart();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.get('/carrito/total', async(req, res) => {
  try {
    const result = await totalCarrito();
    res.json({
            success: true,
            data: result
        });
  } catch (error) {
    res.status(500).json({error: `${error.message}`})
  }
})

export default routes;