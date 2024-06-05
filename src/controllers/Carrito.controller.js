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

export const updateCarritoCantidad = async (idProducto, cantidad) => {
    try {
        const pool = await getconnection();
        await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .input('Cantidad', sql.Int, cantidad)
            .query('UPDATE carrito SET Cantidad = @Cantidad WHERE idProducto = @idProducto');
        console.log('Cantidad actualizada correctamente.');
    } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
        throw new Error('Error al actualizar la cantidad: ' + error.message);
    }
};

export const deleteCarrito = async (idProducto) => {
    try {
        const pool = await getconnection();
        await pool.request()
        .input('idProducto', sql.Int, idProducto)
        .query('DELETE FROM carrito WHERE idProducto = @idProducto');
        console.log('Producto Eliminado con exito');
    } catch (error) {
        console.error('Error al intentar eliminar el producto', error);
        throw new Error('Error al eliminar el elemento ' + error.message);
    }
}