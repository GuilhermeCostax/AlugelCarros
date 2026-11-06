package com.aluguelcarros.service;

import com.aluguelcarros.dto.ClienteRequest;
import com.aluguelcarros.dto.ClienteResponse;
import com.aluguelcarros.dto.RendimentoDTO;
import com.aluguelcarros.exception.RecursoNaoEncontradoException;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.Cliente;
import com.aluguelcarros.model.Perfil;
import com.aluguelcarros.model.Rendimento;
import com.aluguelcarros.model.StatusPedido;
import com.aluguelcarros.model.Usuario;
import com.aluguelcarros.repository.ClienteRepository;
import com.aluguelcarros.repository.PedidoAluguelRepository;
import com.aluguelcarros.repository.UsuarioRepository;
import com.aluguelcarros.security.UsuarioLogado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negócio do CRUD de clientes.
 * Agentes (empresas e bancos) gerenciam todos os clientes; um cliente só acessa os próprios dados.
 */
@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioLogado usuarioLogado;

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar() {
        return clienteRepository.findAllByOrderByNomeAsc().stream().map(ClienteResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id) {
        return ClienteResponse.de(buscarComPermissao(id));
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest req) {
        return ClienteResponse.de(novoCliente(req));
    }

    /** Cria e persiste um cliente (usado pelo CRUD e pelo cadastro público). */
    @Transactional
    public Cliente novoCliente(ClienteRequest req) {
        Documentos.exigir(req.login(), "Informe o login.");
        Documentos.exigir(req.senha(), "Informe a senha.");
        String login = req.login().trim();
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Este login já está em uso.");
        }
        Cliente cliente = new Cliente();
        cliente.setLogin(login);
        cliente.setSenha(passwordEncoder.encode(req.senha()));
        preencher(cliente, req);
        return clienteRepository.save(cliente);
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest req) {
        Cliente cliente = buscarComPermissao(id);
        if (req.login() != null && !req.login().isBlank() && !req.login().trim().equals(cliente.getLogin())) {
            String login = req.login().trim();
            if (usuarioRepository.existsByLogin(login)) {
                throw new RegraNegocioException("Este login já está em uso.");
            }
            cliente.setLogin(login);
        }
        if (req.senha() != null && !req.senha().isBlank()) {
            cliente.setSenha(passwordEncoder.encode(req.senha()));
        }
        preencher(cliente, req);
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    @Transactional
    public void excluir(Long id) {
        Cliente cliente = buscarComPermissao(id);
        if (pedidoRepository.existsByClienteIdAndStatus(id, StatusPedido.CONTRATADO)) {
            throw new RegraNegocioException("Não é possível excluir um cliente com contrato ativo.");
        }
        clienteRepository.delete(cliente);
    }

    private void preencher(Cliente cliente, ClienteRequest req) {
        String cpf = Documentos.somenteDigitos(req.cpf());
        String rg = Documentos.normalizarRg(req.rg());
        boolean novo = cliente.getId() == null;
        if (novo ? clienteRepository.existsByCpf(cpf) : clienteRepository.existsByCpfAndIdNot(cpf, cliente.getId())) {
            throw new RegraNegocioException("Já existe um cliente com este CPF.");
        }
        if (novo ? clienteRepository.existsByRg(rg) : clienteRepository.existsByRgAndIdNot(rg, cliente.getId())) {
            throw new RegraNegocioException("Já existe um cliente com este RG.");
        }
        cliente.setNome(req.nome().trim());
        cliente.setCpf(cpf);
        cliente.setRg(rg);
        cliente.setEndereco(req.endereco().trim());
        cliente.setProfissao(req.profissao().trim());

        List<RendimentoDTO> rendimentos = req.rendimentos() == null ? List.of() : req.rendimentos();
        cliente.limparRendimentos();
        rendimentos.forEach(r -> cliente.adicionarRendimento(
                new Rendimento(r.entidadeEmpregadora().trim(), r.valor())));
    }

    /** Agentes acessam qualquer cliente; um cliente só acessa a si mesmo. */
    private Cliente buscarComPermissao(Long id) {
        Usuario logado = usuarioLogado.get();
        if (logado.getPerfil() == Perfil.CLIENTE && !logado.getId().equals(id)) {
            throw new AccessDeniedException("Acesso negado.");
        }
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
    }
}
