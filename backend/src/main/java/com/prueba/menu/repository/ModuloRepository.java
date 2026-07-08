package com.prueba.menu.repository;

import com.prueba.menu.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    /**
     * Todos los modulos ordenados (para el listado del CRUD).
     */
    List<Modulo> findAllByOrderByOrdenAsc();

    /**
     * Modulos permitidos para un rol (consulta plana; el arbol
     * se construye en memoria en el servicio de menu).
     */
    @Query("""
            SELECT DISTINCT m FROM Modulo m
            JOIN m.roles r
            WHERE r.id = :rolId
            ORDER BY m.orden ASC
            """)
    List<Modulo> findAllByRolId(@Param("rolId") Long rolId);

    /**
     * Hijos directos de un modulo (util para validaciones).
     */
    List<Modulo> findByPadreId(Long padreId);
}
