package com.prueba.menu.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "modulo")
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String ruta;

    @Column(length = 50)
    private String icono;

    @Column(nullable = false)
    private Integer orden = 0;

    /**
     * Autorreferencia: el modulo padre. NULL si es raiz.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo_padre")
    private Modulo padre;

    /**
     * Lado inverso de la autorreferencia: los submodulos.
     */
    @OneToMany(mappedBy = "padre", fetch = FetchType.LAZY)
    @OrderBy("orden ASC")
    private List<Modulo> hijos = new ArrayList<>();

    /**
     * Relacion N a N con Rol mediante la tabla intermedia modulo_rol.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "modulo_rol",
            joinColumns = @JoinColumn(name = "id_modulo"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Rol> roles = new HashSet<>();

    public Modulo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRuta() {
        return ruta;
    }

    public void setRuta(String ruta) {
        this.ruta = ruta;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Modulo getPadre() {
        return padre;
    }

    public void setPadre(Modulo padre) {
        this.padre = padre;
    }

    public List<Modulo> getHijos() {
        return hijos;
    }

    public void setHijos(List<Modulo> hijos) {
        this.hijos = hijos;
    }

    public Set<Rol> getRoles() {
        return roles;
    }

    public void setRoles(Set<Rol> roles) {
        this.roles = roles;
    }
}
