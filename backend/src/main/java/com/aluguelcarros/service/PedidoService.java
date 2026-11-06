package com.aluguelcarros.service;

import com.aluguelcarros.dto.AvaliacaoRequest;
import com.aluguelcarros.dto.PedidoRequest;
import com.aluguelcarros.dto.PedidoResponse;
import com.aluguelcarros.exception.RecursoNaoEncontradoException;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.PedidoAluguelRepository;
import com.aluguelcarros.security.UsuarioLogado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Gestão de pedidos de aluguel.
 * Clientes criam, modificam (enquanto pendentes), consultam e cancelam os próprios pedidos;
 * agentes consultam, modificam e avaliam todos os pedidos.
 */
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoAluguelRepository pedidoRepository;
    private final AutomovelService automovelService;
    private final UsuarioLogado usuarioLogado;

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar() {
        Usuario logado = usuarioLogado.get();
        List<PedidoAluguel> pedidos = logado instanceof Cliente
                ? pedidoRepository.findByClienteIdOrderByDataCriacaoDesc(logado.getId())
                : pedidoRepository.findAllByOrderByDataCriacaoDesc();
        return pedidos.stream().map(PedidoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id) {
        return PedidoResponse.de(buscarComPermissao(id));
    }

    @Transactional
    public PedidoResponse criar(PedidoRequest req) {
        if (!(usuarioLogado.get() instanceof Cliente cliente)) {
            throw new AccessDeniedException("Apenas clientes podem criar pedidos.");
        }
        if (req.dataInicio().isBefore(LocalDate.now())) {
            throw new RegraNegocioException("A data de início não pode estar no passado.");
        }
        Automovel automovel = automovelService.buscarEntidade(req.automovelId());
        verificarDisponibilidade(automovel, req, 0L);
        PedidoAluguel pedido = PedidoAluguel.novo(cliente, automovel, req.dataInicio(), req.dataFim());
        return PedidoResponse.de(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse modificar(Long id, PedidoRequest req) {
        PedidoAluguel pedido = buscarComPermissao(id);
        if (usuarioLogado.get() instanceof Cliente && pedido.getStatus() != StatusPedido.PENDENTE) {
            throw new RegraNegocioException("Você só pode modificar pedidos pendentes.");
        }
        Automovel automovel = automovelService.buscarEntidade(req.automovelId());
        verificarDisponibilidade(automovel, req, pedido.getId());
        pedido.modificar(automovel, req.dataInicio(), req.dataFim());
        return PedidoResponse.de(pedido);
    }

    @Transactional
    public PedidoResponse cancelar(Long id) {
        PedidoAluguel pedido = buscarComPermissao(id);
        if (!(usuarioLogado.get() instanceof Cliente)) {
            throw new AccessDeniedException("Apenas o cliente pode cancelar o pedido.");
        }
        pedido.cancelar();
        return PedidoResponse.de(pedido);
    }

    @Transactional
    public PedidoResponse avaliar(Long id, AvaliacaoRequest req) {
        if (!(usuarioLogado.get() instanceof Agente agente)) {
            throw new AccessDeniedException("Apenas agentes podem avaliar pedidos.");
        }
        PedidoAluguel pedido = buscarEntidade(id);
        String parecer = req.parecer().trim();
        if (req.aprovado()) pedido.aprovar(agente, parecer);
        else pedido.reprovar(agente, parecer);
        return PedidoResponse.de(pedido);
    }

    PedidoAluguel buscarEntidade(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));
    }

    /** Clientes só acessam os próprios pedidos; agentes acessam todos. */
    private PedidoAluguel buscarComPermissao(Long id) {
        PedidoAluguel pedido = buscarEntidade(id);
        Usuario logado = usuarioLogado.get();
        if (logado instanceof Cliente && !pedido.getCliente().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Acesso negado.");
        }
        return pedido;
    }

    private void verificarDisponibilidade(Automovel automovel, PedidoRequest req, Long ignorarPedidoId) {
        if (pedidoRepository.existeConflito(automovel.getId(), req.dataInicio(), req.dataFim(),
                PedidoAluguel.STATUS_ATIVOS, ignorarPedidoId)) {
            throw new RegraNegocioException("O automóvel já está reservado em parte deste período.");
        }
    }
}
