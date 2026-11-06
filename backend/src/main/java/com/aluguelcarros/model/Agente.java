package com.aluguelcarros.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "agente")
@Getter
@Setter
public abstract class Agente extends Usuario {

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;
}
