package com.prueba.menu.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String recurso, Long id) {
        super("%s con id %d no encontrado".formatted(recurso, id));
    }
}
