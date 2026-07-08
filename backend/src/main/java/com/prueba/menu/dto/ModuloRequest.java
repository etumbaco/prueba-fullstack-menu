package com.prueba.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos de entrada para crear o actualizar un modulo.
 * idModuloPadre es opcional: null indica modulo raiz.
 */
public record ModuloRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotBlank(message = "La ruta es obligatoria")
        @Size(max = 255, message = "La ruta no puede superar 255 caracteres")
        String ruta,

        @Size(max = 50, message = "El icono no puede superar 50 caracteres")
        String icono,

        @NotNull(message = "El orden es obligatorio")
        Integer orden,

        Long idModuloPadre
) {
}
