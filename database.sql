-- CellWorld - esquema base para SQL Server
-- La aplicacion tambien crea tablas nuevas con SQLAlchemy al iniciar.

CREATE TABLE roles (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    estado BIT NOT NULL DEFAULT 1
);

CREATE TABLE permisos (
    id_permiso INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    estado BIT NOT NULL DEFAULT 1
);

CREATE TABLE rol_permisos (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso)
);

CREATE TABLE usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL UNIQUE,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(30) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    estado BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol)
);

CREATE TABLE password_reset_tokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    token VARCHAR(6) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES usuarios(id_usuario)
);

CREATE TABLE productos (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    descripcion VARCHAR(500) NULL,
    almacenamiento VARCHAR(50) NULL,
    ram VARCHAR(50) NULL,
    color VARCHAR(50) NULL,
    precio INT NOT NULL DEFAULT 0,
    imagen VARCHAR(500) NULL,
    stock INT NOT NULL DEFAULT 0,
    estado BIT NOT NULL DEFAULT 1
);

CREATE TABLE servicios (
    id_servicio INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500) NULL,
    precio INT NOT NULL DEFAULT 0,
    estado BIT NOT NULL DEFAULT 1
);

CREATE TABLE pedidos (
    id_pedido INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    total INT NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'pagado',
    creado_en DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_pedidos (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id_pedido)
);

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Gestiona toda la plataforma'),
('Cliente', 'Consulta y compra productos'),
('Empleado', 'Gestiona operaciones asignadas');
