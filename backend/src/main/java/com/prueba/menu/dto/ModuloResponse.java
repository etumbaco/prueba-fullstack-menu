package com.prueba.menu.dto;

import java.util.List;

/**
 * Representacion plana de un modulo (para el CRUD).
 * Incluye los ids de los roles asignados y el nombre del padre
 * para facilitar el listado en el frontend.
 */
public record ModuloResponse(
        Long id,
        String nombre,
        String ruta,
        String icono,
        Integer orden,
        Long idModuloPadre,
        String nombrePadre,
        List<Long> rolesIds
) {
}
