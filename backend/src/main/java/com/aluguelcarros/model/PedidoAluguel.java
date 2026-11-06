package com.aluguelcarros.model;

import com.aluguelcarros.exception.RegraNegocioException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "pedido_aluguel")
@Getter
@Setter
public class PedidoAluguel {

    /** Status em que o pedido ainda ocupa o automóvel no período solicitado. */
    public static final Set<StatusPedido> STATUS_ATIVOS =
            Set.of(StatusPedido.PENDENTE, StatusPedido.APROVADO, StatusPedido.CONTRATADO);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "automovel_id", nullable = false)
    private Automovel automovel;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPedido status;

    @Column(length = 500)
    private String parecer;

    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_avaliador_id")
    private Agente agenteAvaliador;

    @OneToOne(mappedBy = "pedido", fetch = FetchType.LAZY)
    private Contrato contrato;

    /** Cria um novo pedido com status PENDENTE. */
    public static PedidoAluguel novo(Cliente cliente, Automovel automovel, LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        PedidoAluguel pedido = new PedidoAluguel();
        pedido.cliente = cliente;
        pedido.automovel = automovel;
        pedido.dataInicio = inicio;
        pedido.dataFim = fim;
        pedido.dataCriacao = LocalDateTime.now();
        pedido.status = StatusPedido.PENDENTE;
        return pedido;
    }

    public void modificar(Automovel automovel, LocalDate inicio, LocalDate fim) {
        if (status != StatusPedido.PENDENTE && status != StatusPedido.APROVADO) {
            throw new RegraNegocioException("Pedidos " + status + " não podem ser modificados.");
        }
        validarPeriodo(inicio, fim);
        this.automovel = automovel;
        this.dataInicio = inicio;
        this.dataFim = fim;
    }

    public void cancelar() {
        if (status != StatusPedido.PENDENTE && status != StatusPedido.APROVADO) {
            throw new RegraNegocioException("Só é possível cancelar pedidos pendentes ou aprovados.");
        }
        status = StatusPedido.CANCELADO;
    }

    public void aprovar(Agente agente, String parecer) {
        registrarAvaliacao(agente, parecer, StatusPedido.APROVADO);
    }

    public void reprovar(Agente agente, String parecer) {
        registrarAvaliacao(agente, parecer, StatusPedido.REPROVADO);
    }

    /** Marca o pedido como contratado (chamado ao executar o contrato). */
    public void contratar() {
        if (status != StatusPedido.APROVADO) {
            throw new RegraNegocioException("Só pedidos aprovados podem gerar contrato.");
        }
        status = StatusPedido.CONTRATADO;
    }

    private void registrarAvaliacao(Agente agente, String parecer, StatusPedido resultado) {
        if (status != StatusPedido.PENDENTE) {
            throw new RegraNegocioException("Só pedidos pendentes podem ser avaliados.");
        }
        this.agenteAvaliador = agente;
        this.parecer = parecer;
        this.dataAvaliacao = LocalDateTime.now();
        this.status = resultado;
    }

    private static void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null || !fim.isAfter(inicio)) {
            throw new RegraNegocioException("A data de fim deve ser posterior à data de início.");
        }
    }
}
