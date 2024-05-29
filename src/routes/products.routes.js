import { Router } from 'express';
import { getProductos, getProducto, getProductos_enoferta } from '../controllers/products.controllers.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const productos = await getProductos();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos: ' + error.message);
    }
});

router.get('/', async (req, res) => {
    try {
        const productosOferta = await getProductos_enoferta();
        res.json(productosOferta);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos: ' + error.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const producto = await getProducto(req.params.id);
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).send('Error al obtener producto: ' + error.message);
    }
});

export default router;
