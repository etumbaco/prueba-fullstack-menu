package com.prueba.menu.dto;

/**
 * Representacion de un rol expuesta por la API.
 */
public record RolResponse(
        Long id,
        String nombre,
        String descripcion
) {
}
