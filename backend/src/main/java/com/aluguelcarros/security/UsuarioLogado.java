package com.aluguelcarros.security;

import com.aluguelcarros.exception.RecursoNaoEncontradoException;
import com.aluguelcarros.model.Usuario;
import com.aluguelcarros.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Acesso ao usuário autenticado na requisição atual. */
@Component
@RequiredArgsConstructor
public class UsuarioLogado {

    private final UsuarioRepository usuarioRepository;

    public String getLogin() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public Usuario get() {
        return usuarioRepository.findByLogin(getLogin())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário autenticado não encontrado."));
    }
}
