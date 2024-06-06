import { getconnection } from "../database/connection.js";
import sql from 'mssql';

export const getCarrito = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query('SELECT * FROM vw_CarritoProductos;');
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
            .query('sp_ActualizarCantidadCarrito @idProducto, @Cantidad;');
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
        .query('EXEC sp_EliminarProductoCarrito @idProducto;');
        console.log('Producto Eliminado con exito');
    } catch (error) {
        console.error('Error al intentar eliminar el producto', error);
        throw new Error('Error al eliminar el elemento ' + error.message);
    }
}

export const Ventas = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query('SELECT * FROM vw_VentasDetalleProductos;');
        console.log('Historial encontrado');
        console.log(result);
        return result.recordset;
    } catch (error) {
        console.error('Error al intentar ver el historial', error);
        throw new Error('Error al ver el historial ' + error.message);
    }
}

export const Ventas_historial = async (id) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
        .input('id', sql.Int, id)
        .query('exec ObtenerDetalleVentaPorIdDetalle @id;');
        console.log('Historial encontrado');
        console.log(result);
        return result.recordset;
    } catch (error) {
        console.error('Error al intentar ver el historial', error);
        throw new Error('Error al ver el historial ' + error.message);
    }
}

export const pagar = async() =>{
    try {
        const pool = await getconnection();
        await pool.request().query('SET IDENTITY_INSERT DetalleVenta ON exec PasarACarrito');
        console.log('Ahora es parte del historial');
    } catch (error) {
        console.error('Error al intentar meter el historial', error);
        throw new Error('Error al meter el historial ' + error.message);
    }
}
