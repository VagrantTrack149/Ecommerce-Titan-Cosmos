import { Router } from 'express';
import { getCategorias, getCategoria } from '../controllers/categoriaController.js';
import { getProductos, getProducto, getProductos_enoferta } from '../controllers/products.controllers.js';

const router = Router();
router.get('/', async (req,res) =>{
    try {
        const categorias= await getCategorias();
        const categoria= await getCategoria();
        const productos = await getProductos();
        const producto = await getProducto();
        const productosOferta= await getProductos_enoferta();
        res.render('producto_categoria',{ categoria,categorias, producto, productos, productosOferta});
    } catch (error) {
        console.error('Error al obtener datos: ', error);
        res.status(500).send('Error al obtener datos: '+error.message);
    }

})

export default router;
