Create database Ecommerce
go
use Ecommerce
go

CREATE TABLE Categoria (
    idCategoria INT PRIMARY KEY IDENTITY,
    Categoria VARCHAR(60) NOT NULL
);

Create table Proveedores(
	idProveedor int primary key identity,
	Proveedor varchar(150) not null,
	dir varchar(150) not null,
	tel varchar(12) not null
);

CREATE TABLE Productos (
    idProducto INT PRIMARY KEY IDENTITY,
    idCategoria INT NOT NULL FOREIGN KEY REFERENCES Categoria(idCategoria),
	idProveedor int not null foreign key references Proveedores(idProveedor),
    Producto VARCHAR(120) NOT NULL,
    Descripcion VARCHAR(MAX) NULL,
    Precio MONEY NOT NULL,
    Stock INT NOT NULL,
    Estado VARCHAR(60) NOT NULL
);

CREATE TABLE img_productos (
    idProducto INT NOT NULL FOREIGN KEY REFERENCES Productos(idProducto),
    img NVARCHAR(MAX) NOT NULL
);

CREATE TABLE Carrito (
    idProducto INT NOT NULL FOREIGN KEY REFERENCES Productos(idProducto),
    Cantidad INT NOT NULL,
    PRIMARY KEY (idProducto)
);

CREATE TABLE DetalleVenta (
    idDetalle INT IDENTITY,
    idProducto INT NOT NULL FOREIGN KEY REFERENCES Productos(idProducto),
    Cantidad INT NOT NULL,
    Fecha DATE NOT NULL
);




create VIEW vw_VentasDetalleProductos AS
SELECT 
    dv.idDetalle,
    CONVERT(VARCHAR, dv.Fecha, 101) AS Fecha, -- Formato de fecha 'yyyy-mm-dd hh:mm:ss'
    STRING_AGG(CONCAT(p.Producto, ' (Cantidad: ', dv.Cantidad, ')'), ', ') AS ProductosConcatenados,
    SUM(dv.Cantidad * p.Precio) AS Total
FROM 
    DetalleVenta dv
INNER JOIN 
    Productos p ON dv.idProducto = p.idProducto
GROUP BY 
    dv.idDetalle, dv.Fecha;



CREATE PROCEDURE ObtenerDetalleVentaPorIdDetalle
    @idDetalle INT
AS
BEGIN
    SELECT 
        dv.idDetalle,
        CONVERT(VARCHAR, dv.Fecha, 101) AS Fecha,
        STRING_AGG(CONCAT(p.Producto, ' (Cantidad: ', dv.Cantidad, ')'), ', ') AS ProductosConcatenados,
        SUM(dv.Cantidad * p.Precio) AS Total
    FROM 
        DetalleVenta dv
    INNER JOIN 
        Productos p ON dv.idProducto = p.idProducto
    WHERE
        dv.idDetalle = @idDetalle
    GROUP BY 
        dv.idDetalle, dv.Fecha;
END;
GO

exec ObtenerDetalleVentaPorIdDetalle 2

CREATE INDEX idx_Producto_idCategoria ON Productos(idCategoria);
CREATE INDEX idx_ImagenProductos_idProducto ON img_productos(idProducto);
CREATE INDEX idx_DetalleVenta_idProducto ON DetalleVenta(idProducto);

--CARRITO VISTA
CREATE VIEW vw_CarritoProductos AS
SELECT 
    c.cantidad,
    p.idProducto,
    p.idCategoria,
    p.idProveedor,
    p.Producto,
    p.Descripcion,
    p.Precio,
    p.Stock,
    p.Estado,
    ip.img,
    c.cantidad * p.Precio AS total_producto,
    SUM(c.cantidad * p.Precio) OVER () AS total_general
FROM 
    carrito c
INNER JOIN 
    Productos p ON c.idProducto = p.idProducto
INNER JOIN 
    img_productos ip ON p.idProducto = ip.idProducto;


SELECT * FROM vw_CarritoProductos;


--ACTUALIZAR CARRITO
CREATE PROCEDURE sp_ActualizarCantidadCarrito
    @idProducto INT,
    @Cantidad INT
AS
BEGIN

    BEGIN TRANSACTION;
    BEGIN TRY

        UPDATE carrito 
        SET Cantidad = @Cantidad 
        WHERE idProducto = @idProducto;
        
        COMMIT TRANSACTION;
        
        PRINT 'Cantidad actualizada exitosamente';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
    END CATCH
END;



EXEC sp_ActualizarCantidadCarrito 1, 5;



--ELIMINAR CARRITO
CREATE PROCEDURE sp_EliminarProductoCarrito
    @idProducto INT
AS
BEGIN

    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM carrito 
        WHERE idProducto = @idProducto;
        
        COMMIT TRANSACTION;
      
        PRINT 'Producto eliminado exitosamente del carrito';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        
    END CATCH
END;


EXEC sp_EliminarProductoCarrito 1;


--CATEGORIAS VISTA
CREATE VIEW vw_Categorias AS
SELECT * FROM Categoria;


SELECT * FROM vw_Categorias;

CREATE PROCEDURE sp_GetProductsByCategory
    @id INT
AS
BEGIN
    SELECT p.*, c.*, ip.img 
    FROM Productos p 
    INNER JOIN Categoria c ON p.idCategoria = c.idCategoria 
    INNER JOIN img_productos ip ON p.idProducto = ip.idProducto 
    WHERE c.idCategoria = @id
    AND p.Estado != 'Descontinuado';
END


EXEC sp_GetProductsByCategory 1;

--VER PRODUCTOS
CREATE VIEW vw_RandomProducts AS
SELECT TOP 6 
    p.idProducto,
    p.idCategoria,
    p.idProveedor,
    p.Producto,
    p.Descripcion,
    p.Precio,
    p.Stock,
    p.Estado,
    ip.img AS Imagen,
    c.Categoria,
    pr.Proveedor
FROM 
    Productos p 
INNER JOIN 
    img_productos ip ON p.idProducto = ip.idProducto 
INNER JOIN 
    Categoria c ON p.idCategoria = c.idCategoria 
INNER JOIN 
    Proveedores pr ON p.idProveedor = pr.idProveedor
WHERE 
    p.Estado != 'Descontinuado'
ORDER BY 
    NEWID();





SELECT * FROM vw_RandomProducts;



--VER PRODUCTOS OFERTA
CREATE VIEW vw_ProductosOferta AS
SELECT 
    p.idProducto,
    p.idCategoria,
    p.idProveedor,
    p.Producto,
    p.Descripcion,
    p.Precio,
    p.Stock,
    p.Estado,
    ip.img AS Imagen
FROM 
    Productos p 
INNER JOIN 
    img_productos ip ON p.idProducto = ip.idProducto 
WHERE 
    p.Estado = 'Oferta';


SELECT * FROM vw_ProductosOferta;



--VER PRODUCTOS ID
CREATE PROCEDURE sp_GetProductoByID
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.*, ip.img 
    FROM Productos p 
    INNER JOIN img_productos ip ON p.idProducto = ip.idProducto 
    WHERE p.idProducto = @id;
END;


EXEC sp_GetProductoByID 123;

--INSERTAR CARRITO

CREATE PROCEDURE sp_InsertarEnCarrito
    @idProducto INT,
    @Cantidad INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Carrito (idProducto, Cantidad) 
    VALUES (@idProducto, @Cantidad);
END;


EXEC sp_InsertarEnCarrito 123, 2 ;


--BUSCAR PRODUCTOS
CREATE PROCEDURE sp_BuscarProductos
    @textoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.*, ip.img 
    FROM Productos p 
    INNER JOIN img_productos ip ON p.idProducto = ip.idProducto 
    WHERE LOWER(p.Descripcion) LIKE '%' + LOWER(@textoBusqueda) + '%'
    AND p.Estado != 'Descontinuado';
END;


EXEC sp_BuscarProductos 'texto de búsqueda';


--INSERTAR PRODUCTO
CREATE PROCEDURE sp_InsertarProducto
    @Producto NVARCHAR(120),
    @Descripcion NVARCHAR(MAX),
    @idCategoria INT,
    @idProveedor INT,
    @Precio MONEY,
    @Stock INT,
    @Estado NVARCHAR(60),
    @Imagen NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idProducto INT;

    -- Insertar en la tabla Productos
    INSERT INTO Productos (Producto, Descripcion, idCategoria, idProveedor, Precio, Stock, Estado)
    VALUES (@Producto, @Descripcion, @idCategoria, @idProveedor, @Precio, @Stock, @Estado);

    -- Obtener el idProducto recién insertado
    SET @idProducto = SCOPE_IDENTITY();

    -- Insertar en la tabla img_productos
    INSERT INTO img_productos (idProducto, img)
    VALUES (@idProducto, @Imagen);
END;



CREATE PROCEDURE sp_EditarCategoria
    @idCategoria INT,
    @nuevoNombre VARCHAR(60)
AS
BEGIN
    UPDATE Categoria
    SET Categoria = @nuevoNombre
    WHERE idCategoria = @idCategoria;
END;

exec sp_EditarCategoria 1, 'Computacion'

CREATE FUNCTION fn_VerCategoriaPorID
(
    @idCategoria INT
)
RETURNS VARCHAR(60)
AS
BEGIN
    DECLARE @Categoria VARCHAR(60);

    SELECT @Categoria = Categoria
    FROM Categoria
    WHERE idCategoria = @idCategoria;

    RETURN @Categoria;
END;

SELECT dbo.fn_VerCategoriaPorID(1) as Categoria


--ACTUALIZAR PRODUCTO
CREATE PROCEDURE sp_ActualizarProducto
    @idProducto INT,
    @Producto VARCHAR(120),
    @Descripcion VARCHAR(MAX),
    @idCategoria INT,
    @idProveedor INT,
    @Precio MONEY,
    @Stock INT,
    @Estado VARCHAR(60)
AS
BEGIN
    UPDATE Productos
    SET Producto = @Producto,
        Descripcion = @Descripcion,
        idCategoria = @idCategoria,
        idProveedor = @idProveedor,
        Precio = @Precio,
        Stock = @Stock,
        Estado = @Estado
    WHERE idProducto = @idProducto;
END;

EXEC sp_ActualizarProducto 123,'Nuevo nombre del producto','Nueva descripción del producto',  1, 29.99,100,'En Uso';


select * from Categoria

-- Insertar la categoría 'Computo'
INSERT INTO Categoria (Categoria) VALUES ('Computo');

-- Insertar la categoría 'Telefonía'
INSERT INTO Categoria (Categoria) VALUES ('Telefonía');

-- Insertar la categoría 'Accesorios'
INSERT INTO Categoria (Categoria) VALUES ('Accesorios');





CREATE PROCEDURE PasarACarrito
AS
BEGIN
    
    INSERT INTO DetalleVenta (idProducto, Cantidad, Fecha)
    SELECT idProducto, Cantidad, GETDATE() FROM Carrito;

    
    DELETE FROM Carrito;
END;
GO


CREATE TRIGGER RestarStockVenta
ON DetalleVenta
AFTER INSERT
AS
BEGIN
    -- Actualizar el stock de productos
    UPDATE p
    SET p.Stock = p.Stock - i.Cantidad,
        p.Estado = CASE WHEN p.Stock - i.Cantidad <= 0 THEN 'Descontinuado' ELSE p.Estado END
    FROM Productos p
    INNER JOIN inserted i ON p.idProducto = i.idProducto;
END;
GO



select * from Carrito
select * from DetalleVenta

exec PasarACarrito


CREATE PROCEDURE PasarACarrito
AS
BEGIN
    DECLARE @MaxIdDetalle INT;

    -- Obtener el máximo valor de idDetalle en DetalleVenta
    SELECT @MaxIdDetalle = ISNULL(MAX(idDetalle), 0) FROM DetalleVenta;
	
    -- Incrementar el valor de @MaxIdDetalle en 1
    SET @MaxIdDetalle = @MaxIdDetalle + 1;

    -- Insertar los registros de Carrito en DetalleVenta con el mismo idDetalle
    INSERT INTO DetalleVenta (idDetalle, idProducto, Cantidad, Fecha)
    SELECT @MaxIdDetalle, idProducto, Cantidad, GETDATE() 
    FROM Carrito;

    -- Borrar los registros de Carrito después de pasarlos a DetalleVenta
    DELETE FROM Carrito;
END;
GO

SET IDENTITY_INSERT DetalleVenta ON


select * from Carrito
select * from DetalleVenta
select * from Productos

exec PasarACarrito


alter table Productos 
add idProveedor int foreign key references Proveedores(idProveedor)


insert into Proveedores values ('Steren','Avenida siempre viva #314','1234567890')



update Productos 
set idProveedor=1


delete from Categoria where idCategoria=8

CREATE PROCEDURE sp_InsertarCategoria
    @NombreCategoria VARCHAR(60)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Categoria (Categoria)
    VALUES (@NombreCategoria);
END;




CREATE PROCEDURE sp_AgregarProveedor
    @NombreProveedor NVARCHAR(100),
    @Direccion NVARCHAR(100),
    @Telefono NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Proveedores (Proveedor, dir, tel)
    VALUES (@NombreProveedor, @Direccion, @Telefono);
END;



CREATE PROCEDURE sp_EditarProveedor
    @IdProveedor INT,
    @NombreProveedor NVARCHAR(100),
    @Direccion NVARCHAR(100),
    @Telefono NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Proveedores
    SET Proveedor = @NombreProveedor,
        dir = @Direccion,
        tel = @Telefono
    WHERE IdProveedor = @IdProveedor;
END;



CREATE FUNCTION dbo.ufn_ProveedorByID (@IdProveedor INT)
RETURNS TABLE
AS
RETURN 
(
    SELECT * FROM Proveedores
    WHERE IdProveedor = @IdProveedor
);

exec sp_EditarProveedor 1,nombre,dir,tel
exec sp_AgregarProveedor nombre, dir, tel
SELECT * FROM dbo.ufn_ProveedorByID(1); 


create table Usuarios(
	idUsuario int primary key identity,
	Usuario varchar(30) not null,
	Contra varchar(40) not null
);


insert into Usuarios values ('Admin','123')


CREATE VIEW AllProductos AS
SELECT 
    p.idProducto,
    p.idCategoria,
    p.idProveedor,
    p.Producto,
    p.Descripcion,
    p.Precio,
    p.Stock,
    p.Estado,
    ip.img AS Imagen,
    c.Categoria,
    pr.Proveedor
FROM 
    Productos p 
INNER JOIN 
    img_productos ip ON p.idProducto = ip.idProducto 
INNER JOIN 
    Categoria c ON p.idCategoria = c.idCategoria 
INNER JOIN 
    Proveedores pr ON p.idProveedor = pr.idProveedor
WHERE 
    p.Estado != 'Descontinuado'


	select * from AllProductos