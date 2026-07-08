package com.prueba.menu.service;

import com.prueba.menu.dto.AsignarRolesRequest;
import com.prueba.menu.dto.ModuloRequest;
import com.prueba.menu.dto.ModuloResponse;
import com.prueba.menu.entity.Modulo;
import com.prueba.menu.entity.Rol;
import com.prueba.menu.exception.ResourceNotFoundException;
import com.prueba.menu.mapper.ModuloMapper;
import com.prueba.menu.repository.ModuloRepository;
import com.prueba.menu.repository.RolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class ModuloService {

    private final ModuloRepository moduloRepository;
    private final RolRepository rolRepository;
    private final ModuloMapper moduloMapper;

    public ModuloService(ModuloRepository moduloRepository,
                         RolRepository rolRepository,
                         ModuloMapper moduloMapper) {
        this.moduloRepository = moduloRepository;
        this.rolRepository = rolRepository;
        this.moduloMapper = moduloMapper;
    }

    @Transactional(readOnly = true)
    public List<ModuloResponse> listar() {
        return moduloRepository.findAllByOrderByOrdenAsc().stream()
                .map(moduloMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ModuloResponse obtenerPorId(Long id) {
        return moduloMapper.toResponse(buscarModulo(id));
    }

    public ModuloResponse crear(ModuloRequest request) {
        Modulo padre = resolverPadre(request.idModuloPadre());
        Modulo modulo = moduloMapper.toEntity(request, padre);
        return moduloMapper.toResponse(moduloRepository.save(modulo));
    }

    public ModuloResponse actualizar(Long id, ModuloRequest request) {
        Modulo modulo = buscarModulo(id);
        Modulo padre = resolverPadre(request.idModuloPadre());
        validarSinCiclos(modulo, padre);
        moduloMapper.updateEntity(modulo, request, padre);
        return moduloMapper.toResponse(moduloRepository.save(modulo));
    }

    public void eliminar(Long id) {
        Modulo modulo = buscarModulo(id);
        // ON DELETE CASCADE en la FK elimina tambien los submodulos.
        moduloRepository.delete(modulo);
    }

    public ModuloResponse asignarRoles(Long id, AsignarRolesRequest request) {
        Modulo modulo = buscarModulo(id);
        Set<Rol> roles = new HashSet<>();
        for (Long rolId : request.rolesIds()) {
            Rol rol = rolRepository.findById(rolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rol", rolId));
            roles.add(rol);
        }
        modulo.setRoles(roles);
        return moduloMapper.toResponse(moduloRepository.save(modulo));
    }

    // ------------------------------------------------------------------
    // Metodos privados de apoyo
    // ------------------------------------------------------------------

    private Modulo buscarModulo(Long id) {
        return moduloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modulo", id));
    }

    /** Resuelve el padre a partir del id (null = modulo raiz). */
    private Modulo resolverPadre(Long idPadre) {
        if (idPadre == null) {
            return null;
        }
        return moduloRepository.findById(idPadre)
                .orElseThrow(() -> new ResourceNotFoundException("Modulo padre", idPadre));
    }

    /**
     * Evita ciclos en el arbol: un modulo no puede ser su propio padre,
     * ni tener como padre a uno de sus descendientes (directo o indirecto).
     * Se recorre la cadena de ancestros del nuevo padre; si en esa cadena
     * aparece el propio modulo, la operacion es invalida. El Set de ids
     * visitados protege ademas contra ciclos preexistentes en los datos.
     */
    private void validarSinCiclos(Modulo modulo, Modulo nuevoPadre) {
        Set<Long> visitados = new HashSet<>();
        Modulo actual = nuevoPadre;
        while (actual != null) {
            if (Objects.equals(actual.getId(), modulo.getId())) {
                throw new IllegalArgumentException(
                        "Asignacion invalida: generaria un ciclo en el arbol de modulos");
            }
            if (!visitados.add(actual.getId())) {
                break; // ciclo preexistente en datos: cortar el recorrido
            }
            actual = actual.getPadre();
        }
    }
}
