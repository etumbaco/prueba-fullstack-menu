package com.prueba.menu.service;

import com.prueba.menu.dto.RolRequest;
import com.prueba.menu.dto.RolResponse;
import com.prueba.menu.entity.Rol;
import com.prueba.menu.exception.ResourceNotFoundException;
import com.prueba.menu.mapper.RolMapper;
import com.prueba.menu.repository.RolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RolService {

    private final RolRepository rolRepository;
    private final RolMapper rolMapper;

    public RolService(RolRepository rolRepository, RolMapper rolMapper) {
        this.rolRepository = rolRepository;
        this.rolMapper = rolMapper;
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listar() {
        return rolRepository.findAll().stream()
                .map(rolMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RolResponse obtenerPorId(Long id) {
        return rolMapper.toResponse(buscarRol(id));
    }

    public RolResponse crear(RolRequest request) {
        Rol rol = rolMapper.toEntity(request);
        return rolMapper.toResponse(rolRepository.save(rol));
    }

    public RolResponse actualizar(Long id, RolRequest request) {
        Rol rol = buscarRol(id);
        rolMapper.updateEntity(rol, request);
        return rolMapper.toResponse(rolRepository.save(rol));
    }

    public void eliminar(Long id) {
        Rol rol = buscarRol(id);
        rolRepository.delete(rol);
    }

    private Rol buscarRol(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", id));
    }
}
