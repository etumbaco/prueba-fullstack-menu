package com.prueba.menu.mapper;

import com.prueba.menu.dto.RolRequest;
import com.prueba.menu.dto.RolResponse;
import com.prueba.menu.entity.Rol;
import org.springframework.stereotype.Component;

/**
 * Conversion manual Entity <-> DTO para Rol.
 * (La prueba permite MapStruct/ModelMapper como opcional;
 * para 3 campos, el mapeo manual es mas claro y sin dependencias.)
 */
@Component
public class RolMapper {

    public RolResponse toResponse(Rol rol) {
        return new RolResponse(rol.getId(), rol.getNombre(), rol.getDescripcion());
    }

    public Rol toEntity(RolRequest request) {
        Rol rol = new Rol();
        rol.setNombre(request.nombre());
        rol.setDescripcion(request.descripcion());
        return rol;
    }

    public void updateEntity(Rol rol, RolRequest request) {
        rol.setNombre(request.nombre());
        rol.setDescripcion(request.descripcion());
    }
}
