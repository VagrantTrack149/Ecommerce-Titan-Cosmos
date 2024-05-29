const sql = require('mssql');

const dbsettings={
    user:"sa",
    password:"Contraseña123!",
    server:"localhost",
    database:"Ecommerce",
    options:{
        encrypt:false,
        trustServerCertificate:true,
    },
};
const getconnection=async () =>{
    try {
        const pool= await sql.connect(dbsettings);
        return pool;
    } catch (error) {
        console.error(error);
    }
}
