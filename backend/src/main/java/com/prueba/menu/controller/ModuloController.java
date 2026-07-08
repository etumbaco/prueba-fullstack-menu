package com.prueba.menu.controller;

import com.prueba.menu.dto.AsignarRolesRequest;
import com.prueba.menu.dto.ModuloRequest;
import com.prueba.menu.dto.ModuloResponse;
import com.prueba.menu.service.ModuloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
@Tag(name = "Modulos", description = "CRUD de modulos y asignacion de roles")
public class ModuloController {

    private final ModuloService moduloService;

    public ModuloController(ModuloService moduloService) {
        this.moduloService = moduloService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los modulos")
    public List<ModuloResponse> listar() {
        return moduloService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un modulo por id")
    public ModuloResponse obtenerPorId(@PathVariable Long id) {
        return moduloService.obtenerPorId(id);
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo modulo")
    public ResponseEntity<ModuloResponse> crear(@Valid @RequestBody ModuloRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduloService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un modulo existente")
    public ModuloResponse actualizar(@PathVariable Long id, @Valid @RequestBody ModuloRequest request) {
        return moduloService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un modulo (y sus submodulos en cascada)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        moduloService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    @Operation(summary = "Asignar roles a un modulo (reemplaza la asignacion actual)")
    public ModuloResponse asignarRoles(@PathVariable Long id,
                                       @Valid @RequestBody AsignarRolesRequest request) {
        return moduloService.asignarRoles(id, request);
    }
}
