import { getconnection } from "../database/connection.js";
import sql from 'mssql'
//select
export const getProductos = async (req, res) => {
    try {
        const pool = await getconnection();
        console.log('Conexión establecida correctamente');
        const result = await pool.request().query('Select * from categorias');
        console.log('Consulta SQL ejecutada correctamente');
        console.log('Datos obtenidos:', result.recordset);
        res.render('categorias', { productos: result.recordset }); // Renderiza la vista 'categorias.ejs' con los datos obtenidos
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos: ' + error.message);
    }
}


//select con where
export const getProducto = async (req,res)=>{
    const pool= await getconnection()
    const result= await pool.request()
    .input('id',sql.Int, req.params.id)
    .query('select * from categorias where idCategoria =@id')
    if (result.rowsAffected[0]==0) {
        return res.status(404).json({message:"Categoria no encontrada"});
    }
    return res.json(result.recordset[0]);
}
//insert
export const nuevoProducto=async (req,res)=>{
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
}