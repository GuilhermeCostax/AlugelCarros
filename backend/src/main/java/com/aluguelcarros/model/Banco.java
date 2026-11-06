package com.aluguelcarros.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "banco")
@DiscriminatorValue("BANCO")
public class Banco extends Agente {

    @Override
    public Perfil getPerfil() {
        return Perfil.BANCO;
    }
}
