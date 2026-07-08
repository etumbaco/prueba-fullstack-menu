package com.prueba.menu.mapper;

import com.prueba.menu.dto.ModuloRequest;
import com.prueba.menu.dto.ModuloResponse;
import com.prueba.menu.entity.Modulo;
import com.prueba.menu.entity.Rol;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class ModuloMapper {

    public ModuloResponse toResponse(Modulo modulo) {
        Modulo padre = modulo.getPadre();
        List<Long> rolesIds = modulo.getRoles().stream()
                .map(Rol::getId)
                .sorted(Comparator.naturalOrder())
                .toList();

        return new ModuloResponse(
                modulo.getId(),
                modulo.getNombre(),
                modulo.getRuta(),
                modulo.getIcono(),
                modulo.getOrden(),
                padre != null ? padre.getId() : null,
                padre != null ? padre.getNombre() : null,
                rolesIds
        );
    }

    public Modulo toEntity(ModuloRequest request, Modulo padre) {
        Modulo modulo = new Modulo();
        aplicar(modulo, request, padre);
        return modulo;
    }

    public void updateEntity(Modulo modulo, ModuloRequest request, Modulo padre) {
        aplicar(modulo, request, padre);
    }

    private void aplicar(Modulo modulo, ModuloRequest request, Modulo padre) {
        modulo.setNombre(request.nombre());
        modulo.setRuta(request.ruta());
        modulo.setIcono(request.icono());
        modulo.setOrden(request.orden());
        modulo.setPadre(padre);
    }
}
