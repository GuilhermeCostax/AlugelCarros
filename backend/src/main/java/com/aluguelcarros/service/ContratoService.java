package com.aluguelcarros.service;

import com.aluguelcarros.dto.ContratoRequest;
import com.aluguelcarros.dto.ContratoResponse;
import com.aluguelcarros.dto.CreditoRequest;
import com.aluguelcarros.dto.PedidoResponse;
import com.aluguelcarros.exception.RecursoNaoEncontradoException;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.ContratoCreditoRepository;
import com.aluguelcarros.repository.ContratoRepository;
import com.aluguelcarros.security.UsuarioLogado;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** Execução de contratos (pedidos aprovados) e concessão de crédito pelos bancos. */
@Service
@RequiredArgsConstructor
public class ContratoService {

    private final ContratoRepository contratoRepository;
    private final ContratoCreditoRepository creditoRepository;
    private final PedidoService pedidoService;
    private final UsuarioLogado usuarioLogado;

    @Transactional(readOnly = true)
    public List<ContratoResponse> listar() {
        Usuario logado = usuarioLogado.get();
        return contratoRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .filter(c -> !(logado instanceof Cliente) || c.getPedido().getCliente().getId().equals(logado.getId()))
                .map(ContratoResponse::de)
                .toList();
    }

    /**
     * Executa o contrato de um pedido aprovado. O automóvel passa a ser registrado em nome do cliente
     * ou do próprio agente que executa o contrato (empresa ou banco), conforme o tipo de contrato.
     */
    @Transactional
    public PedidoResponse executar(Long pedidoId, ContratoRequest req) {
        if (!(usuarioLogado.get() instanceof Agente agente)) {
            throw new AccessDeniedException("Apenas agentes podem executar contratos.");
        }
        PedidoAluguel pedido = pedidoService.buscarEntidade(pedidoId);
        pedido.contratar();

        Usuario proprietario = switch (req.tipoProprietario()) {
            case CLIENTE -> pedido.getCliente();
            case EMPRESA, BANCO -> {
                if (agente.getPerfil().name().equals(req.tipoProprietario().name())) yield agente;
                throw new RegraNegocioException("Como " + agente.getPerfil().name().toLowerCase()
                        + ", você só pode registrar o automóvel em nome do cliente ou em seu próprio nome.");
            }
        };
        pedido.getAutomovel().setProprietario(proprietario);

        Contrato contrato = new Contrato();
        contrato.setPedido(pedido);
        contrato.setAgente(agente);
        contrato.setDataAssinatura(LocalDate.now());
        contrato.setValorTotal(req.valorTotal());
        contrato.setTipoProprietario(req.tipoProprietario());
        pedido.setContrato(contratoRepository.save(contrato));
        return PedidoResponse.de(pedido);
    }

    /** Um banco associa um contrato de crédito a um contrato de aluguel. */
    @Transactional
    public ContratoResponse concederCredito(Long contratoId, CreditoRequest req) {
        if (!(usuarioLogado.get() instanceof Banco banco)) {
            throw new AccessDeniedException("Apenas bancos podem conceder crédito.");
        }
        Contrato contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Contrato não encontrado."));
        if (contrato.getCredito() != null) {
            throw new RegraNegocioException("Este contrato já possui um contrato de crédito.");
        }
        if (req.valor().compareTo(contrato.getValorTotal()) > 0) {
            throw new RegraNegocioException("O crédito não pode ser maior que o valor total do contrato.");
        }
        ContratoCredito credito = new ContratoCredito();
        credito.setContrato(contrato);
        credito.setBanco(banco);
        credito.setValor(req.valor());
        credito.setTaxaJuros(req.taxaJuros());
        credito.setNumeroParcelas(req.numeroParcelas());
        contrato.setCredito(creditoRepository.save(credito));
        return ContratoResponse.de(contrato);
    }
}
