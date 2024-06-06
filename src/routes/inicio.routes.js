// inicio.routes.js

import { Router } from 'express';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { getCategorias, getCategoria } from '../controllers/categoriaController.js';
import { getProductos, getProducto, getProductos_enoferta,insertProductoCarrito, buscarProducto, addProducto, actualizarProducto} from '../controllers/products.controllers.js';
import {getCarrito, updateCarritoCantidad, deleteCarrito, Ventas, Ventas_historial, pagar} from '../controllers/Carrito.controller.js'

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('imagen');

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

router.get('/Administracion', async (req, res) => {
    try {
        const categorias = await getCategorias();
        res.render('Admin', {categorias});
    } catch (error) {
        console.error('Error adminitracion:', error);
        res.status(500).send('Error al administrar: ' + error.message);
    }
})

router.get('/menu_productos', async(req, res) => {
    try {
        const categorias = await getCategorias();
        const productos = await getProductos();
        res.render('Menu_producto', {categorias, productos}); 
    } catch (error) {
        console.error('Error adminitracion:', error);
        res.status(500).send('Error al administrar: ' + error.message);
    }
})

router.get('/historial_ventas', async(req, res) => {
    try {
        const categorias = await getCategorias();
        const ventas = await Ventas();
        res.render('Historial_ventas', {ventas, categorias});
    } catch (error) {
        console.error('Error adminitracion:', error);
        res.status(500).send('Error al administrar: ' + error.message);
    }
})

router.get('/add_producto', async (req, res) => {
    try {
        const categorias = await getCategorias();
        res.render('add_producto', { categorias });
    } catch (error) {
        console.error('Error administración:', error);
        res.status(500).send('Error al administrar: ' + error.message);
    }
});

router.post('/add', addProducto);


router.get('/editar_producto/:idProducto', async (req, res) => {
    try {
        const idProducto = req.params.idProducto;
        const producto = await getProducto(idProducto);
        const categorias = await getCategorias();
        res.render('editar_producto', { producto, categorias });
    } catch (error) {
        console.error('Error al editar el producto:', error);
        res.status(500).send('Error al editar el producto: ' + error.message);
    }
});

router.post('/editar', async (req, res) => {
    try {
        const {idProducto, Producto, Descripcion, Categoria, Precio, Stock, Estado } = req.body;
        console.log("Print_r: "+JSON.stringify(req.body));
        await actualizarProducto(idProducto, Producto, Descripcion, Categoria, Precio, Stock, Estado);
        res.redirect('/menu_productos');
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).send('Error al actualizar el producto: ' + error.message);
    }
});

router.get('/imprimir', async (req, res) => {
    try {
        const carrito = await getCarrito();
        const doc = new PDFDocument();
        const fileName = 'carrito.pdf';
        
        doc.fontSize(12).text('Carrito de Compras', { align: 'center' });
        doc.moveDown();
        
        carrito.forEach(producto => {
            doc.text(`Producto: ${producto.Producto}`);
            doc.text(`Descripción: ${producto.Descripcion}`);
            doc.text(`Precio: ${producto.Precio}`);
            doc.text(`Cantidad: ${producto.cantidad}`);
            doc.text(`Total del Producto: ${producto.total_producto}`);
            doc.moveDown();
        });

        const totalGeneral = carrito.length > 0 ? carrito[0].total_general : 0;
        doc.text(`Total General: ${totalGeneral}`);

        doc.pipe(fs.createWriteStream(fileName));
        doc.end();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        fs.createReadStream(fileName).pipe(res);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF: ' + error.message);
    }
});


router.get('/pago', async(req,res)=> {
    try {
        await pagar();
        res.redirect('/');
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).send('Error al procesar el pago: ' + error.message);
    }
    
})

router.get('/descargar', async (req, res) => {
    try {
        const ventas = await Ventas_historial(req.query.idDetalle);
        const doc = new PDFDocument();
        const fileName = ventas[0].idDetalle + '.pdf';
        
        doc.fontSize(12).text('Carrito de Compras', { align: 'center' });
        doc.moveDown();
        
        ventas.forEach(producto => {
            doc.text(`Producto: ${producto.ProductosConcatenados}`);
            doc.moveDown();
        });

        const totalGeneral = ventas.length > 0 ? ventas[0].Total : 0;
        doc.text(`Total General: ${totalGeneral}`);
        const Fecha = ventas.length > 0 ? ventas[0].Fecha : 'No existe';
        doc.text(`Fecha: ${Fecha}`);
        doc.pipe(fs.createWriteStream(fileName));
        doc.end();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        fs.createReadStream(fileName).pipe(res);
    
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF: ' + error.message);
    }
});


export default router;
