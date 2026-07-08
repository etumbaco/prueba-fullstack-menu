package com.prueba.menu.dto;

import java.util.List;

/**
 * Nodo del arbol de menu. Estructura recursiva:
 * cada nodo contiene la lista de sus hijos (vacia si es hoja).
 * Coincide con el JSON de referencia de la prueba.
 */
public record MenuNodeDTO(
        Long id,
        String nombre,
        String ruta,
        String icono,
        List<MenuNodeDTO> hijos
) {
}
