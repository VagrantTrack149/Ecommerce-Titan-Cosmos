import { Router } from 'express'
import { eliminandoProducto, getProductos, getProducto, nuevoProducto, ActualizandoProducto } from '../controllers/products.controllers.js'
const router = Router()

router.get('/categorias', getProductos);
router.get('/categorias/:id', getProducto);
router.post('/categorias/', nuevoProducto);
router.put('/categorias/:id', ActualizandoProducto);
router.delete('/categorias/:id', eliminandoProducto);
export default router