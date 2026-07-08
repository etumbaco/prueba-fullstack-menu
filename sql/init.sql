-- ============================================================
-- Script de inicialización - Prueba Técnica Full Stack
-- Base de datos: MySQL 8
-- ============================================================

CREATE DATABASE IF NOT EXISTS menu_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE menu_db;

CREATE TABLE rol (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE modulo (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    ruta            VARCHAR(255) NOT NULL,
    icono           VARCHAR(50)  NULL,
    orden           INT          NOT NULL DEFAULT 0,
    id_modulo_padre BIGINT       NULL,
    CONSTRAINT fk_modulo_padre
        FOREIGN KEY (id_modulo_padre) REFERENCES modulo(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_modulo_padre ON modulo(id_modulo_padre);

CREATE TABLE modulo_rol (
    id_modulo BIGINT NOT NULL,
    id_rol    BIGINT NOT NULL,
    PRIMARY KEY (id_modulo, id_rol),
    CONSTRAINT fk_mr_modulo
        FOREIGN KEY (id_modulo) REFERENCES modulo(id) ON DELETE CASCADE,
    CONSTRAINT fk_mr_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4 roles
INSERT INTO rol (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso total a todos los módulos del sistema'),
(2, 'Supervisor',    'Acceso a módulos operativos de su área'),
(3, 'Colaborador',   'Acceso limitado a funciones diarias'),
(4, 'Invitado',      'Acceso temporal de solo lectura');

-- Nivel 1 (raíces)
INSERT INTO modulo (id, nombre, ruta, icono, orden, id_modulo_padre) VALUES
(1, 'Dashboard',        '/dashboard',       'pi pi-home',      1, NULL),
(2, 'Administración',   '/administracion',  'pi pi-cog',       2, NULL),
(3, 'Operaciones',      '/operaciones',     'pi pi-briefcase', 3, NULL),
(4, 'Recursos Humanos', '/rrhh',            'pi pi-users',     4, NULL);

-- Nivel 2
INSERT INTO modulo (id, nombre, ruta, icono, orden, id_modulo_padre) VALUES
(5, 'Módulos',    '/administracion/modulos', 'pi pi-sitemap',      1, 2),
(6, 'Roles',      '/administracion/roles',   'pi pi-id-card',      2, 2),
(7, 'Reportes',   '/operaciones/reportes',   'pi pi-chart-bar',    1, 3),
(8, 'Tareas',     '/operaciones/tareas',     'pi pi-check-square', 2, 3),
(9, 'Vacaciones', '/rrhh/vacaciones',        'pi pi-calendar',     1, 4);

-- Nivel 3
INSERT INTO modulo (id, nombre, ruta, icono, orden, id_modulo_padre) VALUES
(10, 'Reportes Mensuales', '/operaciones/reportes/mensuales', 'pi pi-file', 1, 7);

-- Administrador: todo
INSERT INTO modulo_rol (id_modulo, id_rol) VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1);

-- Supervisor: Dashboard + Operaciones completo + RRHH/Vacaciones
INSERT INTO modulo_rol (id_modulo, id_rol) VALUES
(1,2),(3,2),(7,2),(8,2),(10,2),(4,2),(9,2);

-- Colaborador: Dashboard + Tareas + Vacaciones (padres NO asignados a propósito)
INSERT INTO modulo_rol (id_modulo, id_rol) VALUES
(1,3),(8,3),(9,3);

-- Invitado: Dashboard + Reportes (sin Reportes Mensuales)
INSERT INTO modulo_rol (id_modulo, id_rol) VALUES
(1,4),(7,4);
