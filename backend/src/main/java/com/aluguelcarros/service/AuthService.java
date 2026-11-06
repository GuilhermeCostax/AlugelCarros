package com.aluguelcarros.service;

import com.aluguelcarros.dto.AuthResponse;
import com.aluguelcarros.dto.LoginRequest;
import com.aluguelcarros.dto.RegistroRequest;
import com.aluguelcarros.dto.UsuarioResponse;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.AgenteRepository;
import com.aluguelcarros.repository.ClienteRepository;
import com.aluguelcarros.repository.UsuarioRepository;
import com.aluguelcarros.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
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
            case EMPRESA -> preencherAgente(new Empresa(), req);
            case BANCO -> preencherAgente(new Banco(), req);
        };
        usuario.setLogin(login);
        usuario.setSenha(passwordEncoder.encode(req.senha()));
        usuario.setNome(req.nome().trim());

        usuario = usuarioRepository.save(usuario);
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
        String cpf = Documentos.somenteDigitos(req.cpf());
        String rg = Documentos.normalizarRg(req.rg());
        Documentos.exigir(cpf, "Informe o CPF.");
        Documentos.exigir(rg, "Informe o RG.");
        Documentos.exigir(req.endereco(), "Informe o endereço.");
        Documentos.exigir(req.profissao(), "Informe a profissão.");
        if (clienteRepository.existsByCpf(cpf)) {
            throw new RegraNegocioException("Já existe um cliente com este CPF.");
        }
        if (clienteRepository.existsByRg(rg)) {
            throw new RegraNegocioException("Já existe um cliente com este RG.");
        }
        Cliente cliente = new Cliente();
        cliente.setCpf(cpf);
        cliente.setRg(rg);
        cliente.setEndereco(req.endereco().trim());
        cliente.setProfissao(req.profissao().trim());
        return cliente;
    }

    private Agente preencherAgente(Agente agente, RegistroRequest req) {
        String cnpj = Documentos.somenteDigitos(req.cnpj());
        Documentos.exigir(cnpj, "Informe o CNPJ.");
        if (agenteRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe um agente com este CNPJ.");
        }
        agente.setCnpj(cnpj);
        return agente;
    }
}
