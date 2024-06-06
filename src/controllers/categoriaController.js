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