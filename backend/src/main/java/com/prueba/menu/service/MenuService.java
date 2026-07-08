package com.prueba.menu.service;

import com.prueba.menu.dto.MenuNodeDTO;
import com.prueba.menu.entity.Modulo;
import com.prueba.menu.exception.ResourceNotFoundException;
import com.prueba.menu.repository.ModuloRepository;
import com.prueba.menu.repository.RolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Construye el arbol de menu filtrado por rol.
 *
 * Estrategia: una sola consulta trae la lista PLANA de modulos
 * permitidos; el arbol se arma EN MEMORIA (el menu tiene pocas
 * decenas de nodos, no se justifica un CTE recursivo en SQL).
 */
@Service
@Transactional(readOnly = true)
public class MenuService {

    private final ModuloRepository moduloRepository;
    private final RolRepository rolRepository;

    public MenuService(ModuloRepository moduloRepository, RolRepository rolRepository) {
        this.moduloRepository = moduloRepository;
        this.rolRepository = rolRepository;
    }

    public List<MenuNodeDTO> obtenerMenuPorRol(Long rolId) {
        if (!rolRepository.existsById(rolId)) {
            throw new ResourceNotFoundException("Rol", rolId);
        }

        // 1) Lista plana de modulos permitidos para el rol
        List<Modulo> permitidos = moduloRepository.findAllByRolId(rolId);

        // 2) Incluir tambien los ancestros de cada permitido:
        //    un padre se renderiza si tiene descendientes visibles,
        //    aunque el mismo no este asignado al rol.
        //    El Set 'visitados' protege contra ciclos en los datos.
        Map<Long, Modulo> incluidos = new LinkedHashMap<>();
        for (Modulo modulo : permitidos) {
            Modulo actual = modulo;
            Set<Long> visitados = new HashSet<>();
            while (actual != null && visitados.add(actual.getId())) {
                incluidos.putIfAbsent(actual.getId(), actual);
                actual = actual.getPadre();
            }
        }

        // 3) Agrupar los incluidos por el id de su padre
        Map<Long, List<Modulo>> hijosPorPadre = new HashMap<>();
        List<Modulo> raices = new ArrayList<>();
        for (Modulo modulo : incluidos.values()) {
            Modulo padre = modulo.getPadre();
            if (padre == null || !incluidos.containsKey(padre.getId())) {
                raices.add(modulo);
            } else {
                hijosPorPadre.computeIfAbsent(padre.getId(), k -> new ArrayList<>())
                        .add(modulo);
            }
        }

        // 4) Convertir recursivamente a DTO, ordenando por 'orden'
        return raices.stream()
                .sorted(Comparator.comparing(Modulo::getOrden))
                .map(raiz -> toNode(raiz, hijosPorPadre))
                .toList();
    }

    /**
     * Conversion recursiva: el metodo se llama a si mismo
     * por cada hijo del nodo actual.
     */
    private MenuNodeDTO toNode(Modulo modulo, Map<Long, List<Modulo>> hijosPorPadre) {
        List<MenuNodeDTO> hijos = hijosPorPadre
                .getOrDefault(modulo.getId(), List.of())
                .stream()
                .sorted(Comparator.comparing(Modulo::getOrden))
                .map(hijo -> toNode(hijo, hijosPorPadre))
                .toList();

        return new MenuNodeDTO(
                modulo.getId(),
                modulo.getNombre(),
                modulo.getRuta(),
                modulo.getIcono(),
                hijos
        );
    }
}
