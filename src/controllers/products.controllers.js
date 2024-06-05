import { getconnection } from "../database/connection.js";
import sql from 'mssql';
import multer from 'multer';
import fs from 'fs';
//select
export const getProductos = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query('SELECT TOP 12 p.*, ip.img, c.Categoria FROM Productos p INNER JOIN img_productos ip ON p.idProducto = ip.idProducto INNER JOIN Categorias c ON p.idCategoria = c.idCategoria ORDER BY NEWID()');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw new Error('Error al obtener productos: ' + error.message);
    }
};


export const getProductos_enoferta = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query("SELECT p.*, ip.img FROM Productos p INNER JOIN img_productos ip ON p.idProducto = ip.idProducto where Estado='Oferta'");
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw new Error('Error al obtener productos: ' + error.message);
    }
};

export const getProducto = async (id) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT p.*, ip.img FROM Productos p INNER JOIN img_productos ip ON p.idProducto = ip.idProducto WHERE p.idProducto = @id');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener producto:', error);
        throw new Error('Error al obtener producto: ' + error.message);
    }
};

//insert

export const insertProductoCarrito = async (idProducto, Cantidad) => {
    try {
        const pool = await getconnection();
        await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .input('Cantidad', sql.Int, Cantidad)
            .query('INSERT INTO Carrito (idProducto, Cantidad) VALUES (@idProducto, @Cantidad)');
    } catch (error) {
        console.error('Error al insertar producto en el carrito:', error);
        throw new Error('Error al insertar producto en el carrito: ' + error.message);
    }
};

export const buscarProducto = async (texto) => {
    try {
        const recibe= " '%"+texto+"%'";
        console.log(texto);
        const pool = await getconnection();
        const result = await pool.request()
            .query('SELECT p.*, ip.img FROM Productos p INNER JOIN img_productos ip ON p.idProducto = ip.idProducto WHERE LOWER(p.Descripcion) LIKE '+ recibe);
            console.log(result);
        return result.recordset;
    } catch (error) {
        console.error('Error al buscar productos:', error);
        throw new Error('Error al buscar productos: ' + error.message);
    }
};


// Configuración de multer para manejar la subida de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('imagen');

export const addProducto = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Error al subir la imagen:', err);
            return res.status(500).send('Error al subir la imagen: ' + err.message);
        }

        try {
            const { Producto, Descripcion, Categoria, Precio, Stock, Estado } = req.body;

            // Convierte la imagen a base64
            const imagenBase64 = "data:image/jpeg;base64,"+req.file.buffer.toString('base64');

            const pool = await getconnection();
            await pool.request()
                .input('Producto', sql.NVarChar, Producto)
                .input('Descripcion', sql.NVarChar, Descripcion)
                .input('idCategoria', sql.Int, Categoria)
                .input('Precio', sql.Decimal, Precio)
                .input('Stock', sql.Int, Stock)
                .input('Estado', sql.NVarChar, Estado)
                .input('Imagen', sql.VarChar(sql.MAX), imagenBase64)
                .query(`
                    INSERT INTO Productos (Producto, Descripcion, idCategoria, Precio, Stock, Estado)
                    VALUES (@Producto, @Descripcion, @idCategoria, @Precio, @Stock, @Estado);

                    DECLARE @idProducto INT = SCOPE_IDENTITY();

                    INSERT INTO img_productos (idProducto, img)
                    VALUES (@idProducto, @Imagen);
                `);
            console.log(imagenBase64);
            res.redirect('/menu_productos'); 
        } catch (error) {
            console.error('Error al registrar el producto:', error);
            res.status(500).send('Error al registrar el producto: ' + error.message);
        }
    });
};

export const actualizarProducto = async (idProducto, Producto, Descripcion, Categoria, Precio, Stock, Estado) => {
    try {
        console.log(idProducto);
        console.log(Producto);
        console.log(Descripcion);
        console.log(Categoria);
        console.log(Precio);
        const pool = await getconnection();
        await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .input('Producto', sql.NVarChar(100), Producto)
            .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
            .input('Categoria', sql.Int, Categoria)
            .input('Precio', sql.Decimal(10, 2), Precio)
            .input('Stock', sql.Int, Stock)
            .input('Estado', sql.NVarChar(100), Estado)
            .query('UPDATE Productos SET Producto = @Producto, Descripcion = @Descripcion, idCategoria = @Categoria, Precio = @Precio, Stock = @Stock, Estado = @Estado WHERE idProducto = @idProducto');
        console.log('Producto actualizado con éxito');
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        throw new Error('Error al actualizar el producto: ' + error.message);
    }
};
/*export const nuevoProducto=async (req,res)=>{
    console.log(req.body)
    const pool=await getconnection()
    const result= await pool.request()
    .input("name", sql.VarChar(50),req.body.name)
    .query("insert into categorias (Categoria) values (@name)")
    console.log(result)
    //res.send('creando')
}
//edit
export const ActualizandoProducto=async(req,res)=>{
    const pool= await getconnection()
    const result= await pool.request()
    .input('id',sql.Int, req.params.id)
    .input('categoria',sql.VarChar(50),req.body.categoria)
    .query('update categorias set categoria = @categoria where idCategoria = @id')
    if (result.rowsAffected[0]==0) {
        return res.status(404).json({message:"Categoria no actualizada"});
    }
    return res.json({
        id: req.params.id,
        categoria: req.body.categoria,
    });
}
//delete
export const eliminandoProducto=async (req,res)=>{
    const pool= await getconnection()
    const result= await pool.request()
    .input('id',sql.Int, req.params.id)
    .query('delete * from categorias where idCategoria =@id')
    if (result.rowsAffected[0]==0) {
        return res.status(404).json({message:"Categoria no encontrada"});
    }
    return res.json(result.recordset[0]);
}*/