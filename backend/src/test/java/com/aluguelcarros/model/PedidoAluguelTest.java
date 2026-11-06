package com.aluguelcarros.model;

import com.aluguelcarros.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PedidoAluguelTest {

    private final LocalDate inicio = LocalDate.now().plusDays(1);
    private final LocalDate fim = inicio.plusDays(5);
    private PedidoAluguel pedido;
    private Agente agente;

    @BeforeEach
    void setUp() {
        pedido = PedidoAluguel.novo(new Cliente(), new Automovel(), inicio, fim);
        agente = new Empresa();
    }

    @Test
    @DisplayName("Novo pedido começa PENDENTE")
    void novoPedidoPendente() {
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.PENDENTE);
        assertThat(pedido.getDataCriacao()).isNotNull();
    }

    @Test
    @DisplayName("Data de fim deve ser posterior à de início")
    void periodoInvalido() {
        assertThatThrownBy(() -> PedidoAluguel.novo(new Cliente(), new Automovel(), fim, inicio))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> PedidoAluguel.novo(new Cliente(), new Automovel(), inicio, inicio))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Aprovar registra agente, parecer e data")
    void aprovar() {
        pedido.aprovar(agente, "Renda compatível");
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.APROVADO);
        assertThat(pedido.getAgenteAvaliador()).isSameAs(agente);
        assertThat(pedido.getParecer()).isEqualTo("Renda compatível");
        assertThat(pedido.getDataAvaliacao()).isNotNull();
    }

    @Test
    @DisplayName("Só pedidos pendentes podem ser avaliados")
    void avaliarDuasVezes() {
        pedido.reprovar(agente, "Renda insuficiente");
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.REPROVADO);
        assertThatThrownBy(() -> pedido.aprovar(agente, "x")).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Contrato só a partir de pedido aprovado")
    void contratar() {
        assertThatThrownBy(pedido::contratar).isInstanceOf(RegraNegocioException.class);
        pedido.aprovar(agente, "ok");
        pedido.contratar();
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.CONTRATADO);
    }

    @Test
    @DisplayName("Cancelar é permitido em PENDENTE e APROVADO, não em CONTRATADO")
    void cancelar() {
        pedido.cancelar();
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.CANCELADO);

        PedidoAluguel contratado = PedidoAluguel.novo(new Cliente(), new Automovel(), inicio, fim);
        contratado.aprovar(agente, "ok");
        contratado.contratar();
        assertThatThrownBy(contratado::cancelar).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Pedido cancelado não pode ser modificado")
    void modificarCancelado() {
        pedido.cancelar();
        assertThatThrownBy(() -> pedido.modificar(new Automovel(), inicio, fim.plusDays(1)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Modificar altera automóvel e período")
    void modificar() {
        Automovel outro = new Automovel();
        pedido.modificar(outro, inicio.plusDays(1), fim.plusDays(2));
        assertThat(pedido.getAutomovel()).isSameAs(outro);
        assertThat(pedido.getDataFim()).isEqualTo(fim.plusDays(2));
    }
}
