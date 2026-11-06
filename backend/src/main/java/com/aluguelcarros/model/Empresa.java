package com.aluguelcarros.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresa")
@DiscriminatorValue("EMPRESA")
public class Empresa extends Agente {

    @Override
    public Perfil getPerfil() {
        return Perfil.EMPRESA;
    }
}
