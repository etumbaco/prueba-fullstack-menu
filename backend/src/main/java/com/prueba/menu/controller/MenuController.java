package com.prueba.menu.controller;

import com.prueba.menu.dto.MenuNodeDTO;
import com.prueba.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@Tag(name = "Menu", description = "Arbol de navegacion filtrado por rol")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    @Operation(summary = "Obtener el arbol de modulos visible para un rol")
    public List<MenuNodeDTO> obtenerMenu(@RequestParam Long rolId) {
        return menuService.obtenerMenuPorRol(rolId);
    }
}
