package com.prueba.menu.repository;

import com.prueba.menu.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {

    boolean existsByNombre(String nombre);
}
