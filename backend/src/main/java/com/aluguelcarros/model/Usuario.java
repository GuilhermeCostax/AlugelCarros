package com.aluguelcarros.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo")
@Getter
@Setter
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String login;

    @Column(nullable = false, length = 100)
    private String senha;

    @Column(nullable = false, length = 120)
    private String nome;

    public abstract Perfil getPerfil();
}
