import express from 'express';
import morgan from 'morgan';
import productsRoutes from './routes/products.routes.js';

const app = express();

// Configuración de Morgan para registrar las solicitudes HTTP
app.use(morgan('dev'));

app.set('view engine','ejs');
app.set('views','D:/Documentos/Sistemas de información/NodeJS Prueba/src/view')
// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('D:/Documentos/Sistemas de información/NodeJS Prueba/src/public'));
// Rutas
app.use('/', productsRoutes);

export default app;