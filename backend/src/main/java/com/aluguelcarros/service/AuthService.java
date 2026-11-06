package com.aluguelcarros.service;

import com.aluguelcarros.dto.AuthResponse;
import com.aluguelcarros.dto.ClienteRequest;
import com.aluguelcarros.dto.LoginRequest;
import com.aluguelcarros.dto.RegistroRequest;
import com.aluguelcarros.dto.UsuarioResponse;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.AgenteRepository;
import com.aluguelcarros.repository.UsuarioRepository;
import com.aluguelcarros.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteService clienteService;
    private final AgenteRepository agenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional
    public AuthResponse registrar(RegistroRequest req) {
        String login = req.login().trim();
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Este login já está em uso.");
        }

        Usuario usuario = switch (req.perfil()) {
            case CLIENTE -> novoCliente(req);
            case EMPRESA -> novoAgente(new Empresa(), req);
            case BANCO -> novoAgente(new Banco(), req);
        };
        return new AuthResponse(tokenService.gerarToken(usuario), UsuarioResponse.de(usuario));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository.findByLogin(req.login().trim())
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenha()))
                .orElseThrow(() -> new BadCredentialsException("Login ou senha inválidos."));
        return new AuthResponse(tokenService.gerarToken(usuario), UsuarioResponse.de(usuario));
    }

    private Cliente novoCliente(RegistroRequest req) {
        Documentos.exigir(req.cpf(), "Informe o CPF.");
        Documentos.exigir(req.rg(), "Informe o RG.");
        Documentos.exigir(req.endereco(), "Informe o endereço.");
        Documentos.exigir(req.profissao(), "Informe a profissão.");
        return clienteService.novoCliente(new ClienteRequest(req.nome(), req.rg(), req.cpf(),
                req.endereco(), req.profissao(), List.of(), req.login(), req.senha()));
    }

    private Agente novoAgente(Agente agente, RegistroRequest req) {
        String cnpj = Documentos.somenteDigitos(req.cnpj());
        Documentos.exigir(cnpj, "Informe o CNPJ.");
        if (agenteRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe um agente com este CNPJ.");
        }
        agente.setCnpj(cnpj);
        agente.setLogin(req.login().trim());
        agente.setSenha(passwordEncoder.encode(req.senha()));
        agente.setNome(req.nome().trim());
        return usuarioRepository.save(agente);
    }
}
