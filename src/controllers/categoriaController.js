import { getconnection } from "../database/connection.js";
import sql from 'mssql';

export const getCategorias = async () => {
    try {
        const pool = await getconnection();
        const result = await pool.request().query('SELECT * FROM vw_Categorias;');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw new Error('Error al obtener categorías: ' + error.message);
    }
};

export const getCategoria = async (id) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('EXEC sp_GetProductsByCategory @id;');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw new Error('Error al obtener productos: ' + error.message);
    }
};


export const ActualizarCategoria = async(id,Categoria) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('Categoria', sql.VarChar(25), Categoria)
            .query('exec sp_EditarCategoria @id, @Categoria;');
        return result.recordset;
    } catch (error) {
        console.error('Error al actualizar Categoria:', error);
        throw new Error('Error al actualizar Categoria: ' + error.message);
    }
};


export const VerCategoria = async(id) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT dbo.fn_VerCategoriaPorID(@id) as Categoria');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener Categoria:', error);
        throw new Error('Error al obtener Categoria: ' + error.message);
    }
};

export const addCategoria = async(Categoria) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('Categoria', sql.VarChar(25), Categoria)
            .query('EXEC sp_InsertarCategoria @Categoria;');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener Categoria:', error);
        throw new Error('Error al obtener Categoria: ' + error.message);
    }
};
////////////////////////////////////////////////7


export const ActualizarProveedor = async(id,Proveedor, Direccion, Telefono) => {
    try {
        console.log(Proveedor);
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('Proveedor', sql.VarChar(60), Proveedor)
            .input('Direccion', sql.VarChar(60), Direccion)
            .input('Telefono', sql.VarChar(60), Telefono)
            .query('exec sp_EditarProveedor @id, @Proveedor,@Direccion, @Telefono;');
        return result.recordset;
    } catch (error) {
        console.error('Error al actualizar Proveedor:', error);
        throw new Error('Error al actualizar Proveedor: ' + error.message);
    }
};


export const VerProveedor = async(id) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.ufn_ProveedorByID(@id); ');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener Proveedor:', error);
        throw new Error('Error al obtener Proveedor: ' + error.message);
    }
};

export const addProveedor = async(Proveedor, Direccion,Telefono) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('Proveedor', sql.VarChar(60), Proveedor)
            .input('Direccion', sql.VarChar(100), Direccion)
            .input('Telefono', sql.VarChar(10), Telefono)
            .query('exec sp_AgregarProveedor @Proveedor,@Direccion,@Telefono;');
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener Proveedor:', error);
        throw new Error('Error al obtener Proveedor: ' + error.message);
    }
};

//insert
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