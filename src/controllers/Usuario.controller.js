import { getconnection } from "../database/connection.js";
import sql from 'mssql';

export const verificarCredenciales = async (usuario, contra) => {
    try {
        const pool = await getconnection();
        const result = await pool.request()
            .input('usuario', sql.VarChar(30), usuario)
            .input('contra', sql.VarChar(40), contra)
            .query('SELECT COUNT(*) AS count FROM Usuarios WHERE Usuario = @usuario AND Contra = @contra');
        return result.recordset;
        
    } catch (error) {
        console.error('Error al verificar las credenciales:', error);
        res.status(500).send('Error al verificar las credenciales. Por favor, inténtelo de nuevo.');
    }
};