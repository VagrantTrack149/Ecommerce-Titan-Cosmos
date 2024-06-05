// inicio.routes.js

import { Router } from 'express';
import { getCategorias, getCategoria } from '../controllers/categoriaController.js';
import { getProductos, getProducto, getProductos_enoferta,insertProductoCarrito, buscarProducto} from '../controllers/products.controllers.js';
import {getCarrito, updateCarritoCantidad, deleteCarrito} from '../controllers/Carrito.controller.js'
const router = Router();

router.get('/', async (req,res) =>{
    try {
        const categorias = await getCategorias();
        const categoria = await getCategoria();
        const productos = await getProductos();
        const producto = await getProducto();
        const productosOferta = await getProductos_enoferta();
        res.render('inicio',{ categorias, categoria, producto, productos, productosOferta });
    } catch (error) {
        console.error('Error al obtener datos: ', error);
        res.status(500).send('Error al obtener datos: '+error.message);
    }
});

router.get('/categoria/:id', async (req, res) => {
    try {
        const categorias = await getCategorias();
        const categoria = await getCategoria(req.params.id);
        console.log(categoria);
        res.render('categoria_detalles', { categoria, categorias});
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).send('Error al obtener categoría: ' + error.message);
    }
});


router.get('/producto/:id', async (req, res) => {
    try {
        const categorias = await getCategorias();
        const producto_detalles = await getProducto(req.params.id);
        const productos = await getProductos();
        console.log(producto_detalles);
        res.render('producto_detalles',  {producto_detalles,categorias,productos} );
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).send('Error al obtener categoría: ' + error.message);
    }
});

router.post('/producto_carrito', async (req, res) => {
    try {
        const { idProducto, Cantidad } = req.body;
        await insertProductoCarrito(idProducto, Cantidad);
        res.redirect('/carrito');  // Redirige a la página principal o a donde desees
    } catch (error) {
        console.error('Error al meter el producto en el carrito:', error);
        res.status(500).send('Error al insertar producto en el carrito: ' + error.message);
    }
});

router.get('/Carrito',async (req,res) => {
    try {
        const carrito = await getCarrito();
        const categorias= await getCategorias();
        const productos = await getProductos();
        res.render('carrito', { carrito, categorias, productos });
    } catch (error) {
        console.error('Error al insertar producto en el carrito:', error);
        res.status(500).send('Error al insertar producto en el carrito: ' + error.message);
    }
})

router.post('/actualizar_carrito', async (req, res) => {
    try {
        const { idProducto, Cantidad } = req.body;
        await updateCarritoCantidad(idProducto, Cantidad);
        const carrito = await getCarrito();
        const categorias= await getCategorias();
        const productos = await getProductos();
        res.render('carrito', { carrito, categorias, productos });
    } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
        res.status(500).send('Error al actualizar la cantidad: ' + error.message);
    }
});

router.post('/borrar_elemento_carrito', async (req,res) => {
    try {
        const {idProducto} = req.body;
        await deleteCarrito(idProducto);
        const carrito = await getCarrito();
        const categorias= await getCategorias();
        const productos = await getProductos();
        res.render('carrito', { carrito, categorias, productos });
    } catch (error) {
        console.error('Error al intentar eliminar el producto', error);
        res.status(500).send('Error al eliminar el elemento ' + error.message);
    }
})

router.post('/buscar', async (req, res) => {
    try {
        const categorias = await getCategorias();
        const {texto} = req.body;
        const buscar = await buscarProducto(texto);
        console.log('req.query: ' + texto);
        console.log(buscar);
        res.render('busqueda', { buscar, categorias});
    } catch (error) {
        console.error('Error al buscar contenido:', error);
        res.status(500).send('Error al buscar contenido: ' + error.message);
    }
});


export default router;
