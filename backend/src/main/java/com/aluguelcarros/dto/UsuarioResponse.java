package com.aluguelcarros.dto;

import com.aluguelcarros.model.Perfil;
import com.aluguelcarros.model.Usuario;

public record UsuarioResponse(Long id, String login, String nome, Perfil perfil) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getLogin(), usuario.getNome(), usuario.getPerfil());
    }
}
