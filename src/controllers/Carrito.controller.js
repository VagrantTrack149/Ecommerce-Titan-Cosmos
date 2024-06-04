import { getconnection } from "../database/connection.js";
import sql from 'mssql';

export const getCarrito = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query('SELECT c.cantidad, p.*, ip.img, c.cantidad * p.Precio AS total_producto, SUM(c.cantidad * p.Precio) OVER () AS total_general FROM carrito c INNER JOIN Productos p ON c.idProducto = p.idProducto INNER JOIN img_productos ip ON p.idProducto = ip.idProducto;');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        throw new Error('Error al obtener el carrito: ' + error.message);
    }
};
