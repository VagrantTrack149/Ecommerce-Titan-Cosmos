Create database Ecommerce
go
use Ecommerce
go

CREATE TABLE Categoria (
    idCategoria INT PRIMARY KEY IDENTITY,
    Categoria VARCHAR(60) NOT NULL
);


CREATE TABLE Productos (
    idProducto INT PRIMARY KEY IDENTITY,
    idCategoria INT NOT NULL FOREIGN KEY REFERENCES Categoria(idCategoria),
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
    p.*, 
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
SELECT TOP 12 p.*, ip.img, c.Categoria 
FROM Productos p 
INNER JOIN img_productos ip ON p.idProducto = ip.idProducto 
INNER JOIN Categoria c ON p.idCategoria = c.idCategoria 
WHERE p.Estado !='Descontinuado'
ORDER BY NEWID();



SELECT * FROM vw_RandomProducts;



--VER PRODUCTOS OFERTA
CREATE VIEW vw_ProductosOferta AS
SELECT p.*, ip.img 
FROM Productos p 
INNER JOIN img_productos ip ON p.idProducto = ip.idProducto 
WHERE Estado = 'Oferta';

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
    @Precio MONEY,
    @Stock INT,
    @Estado NVARCHAR(60),
    @Imagen NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idProducto INT;

    
    INSERT INTO Productos (Producto, Descripcion, idCategoria, Precio, Stock, Estado)
    VALUES (@Producto, @Descripcion, @idCategoria, @Precio, @Stock, @Estado);

    
    SET @idProducto = SCOPE_IDENTITY();

   
    INSERT INTO img_productos (idProducto, img)
    VALUES (@idProducto, @Imagen);
END;




--ACTUALIZAR PRODUCTO

CREATE PROCEDURE sp_ActualizarProducto
    @idProducto INT,
    @Producto VARCHAR(120),
    @Descripcion VARCHAR(MAX),
    @Categoria INT,
    @Precio MONEY,
    @Stock INT,
    @Estado VARCHAR(60)
AS
BEGIN
    UPDATE Productos
    SET Producto = @Producto,
        Descripcion = @Descripcion,
        idCategoria = @Categoria,
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