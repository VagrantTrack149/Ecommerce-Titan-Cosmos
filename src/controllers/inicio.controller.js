import { getconnection } from "../database/connection.js";
import sql from 'mssql';

export const getInicio = async (req, res) => {
    try {
        const pool = await getconnection();
        console.log('Conexión establecida correctamente');

        // Obtener categorías
        const categoriasResult = await pool.request().query('SELECT * FROM categorias');
        console.log('Categorías obtenidas:', categoriasResult.recordset);

        // Obtener productos
        const productosResult = await pool.request().query('SELECT * FROM productos');
        console.log('Productos obtenidos:', productosResult.recordset);

        // Obtener productos en oferta (puedes ajustar la consulta según tu lógica)
        const productosOfertaResult = await pool.request().query('SELECT * FROM productos WHERE estado = "Oferta"');
        console.log('Productos en oferta obtenidos:', productosOfertaResult.recordset);

        // Renderizar la vista con los datos obtenidos
        res.render('inicio', { 
            categorias: categoriasResult.recordset, 
            productos: productosResult.recordset,
            productosOferta: productosOfertaResult.recordset
        });
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).send('Error al obtener datos: ' + error.message);
    }
};
