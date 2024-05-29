import express from 'express';
import morgan from 'morgan';
import inicioRoutes from './routes/inicio.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import productsRoutes from './routes/products.routes.js';
const app = express();

// Configuración de Morgan para registrar las solicitudes HTTP
app.use(morgan('dev'));

app.set('view engine','ejs');
app.set('views','D:/Documentos/Sistemas de información/NodeJS prueba final si no a php/src/view/')
// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('D:/Documentos/Sistemas de información/NodeJS prueba final si no a php/src/public/'));
// Rutas
app.use('/', inicioRoutes);
//app.use('/categorias', categoriaRoutes);
//app.use('/productos', productsRoutes);

export default app;