import { Router } from 'express';
import { getCategorias, getCategoria } from '../controllers/categoriaController.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const categorias = await getCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).send('Error al obtener categorías: ' + error.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const categoria = await getCategoria(req.params.id);
        res.json(categoria);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos: ' + error.message);
    }
});

export default router;
