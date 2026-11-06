package com.aluguelcarros.dto;

import com.aluguelcarros.model.Perfil;
import com.aluguelcarros.model.Usuario;

public record UsuarioResumo(Long id, String nome, Perfil perfil) {

    public static UsuarioResumo de(Usuario u) {
        return u == null ? null : new UsuarioResumo(u.getId(), u.getNome(), u.getPerfil());
    }
}
