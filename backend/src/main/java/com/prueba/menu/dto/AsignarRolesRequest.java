package com.prueba.menu.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Cuerpo del endpoint POST /api/modulos/{id}/roles.
 */
public record AsignarRolesRequest(

        @NotEmpty(message = "Debe indicar al menos un rol")
        List<Long> rolesIds
) {
}
