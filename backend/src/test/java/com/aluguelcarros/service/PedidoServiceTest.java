package com.aluguelcarros.service;

import com.aluguelcarros.dto.PedidoRequest;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.PedidoAluguelRepository;
import com.aluguelcarros.security.UsuarioLogado;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock PedidoAluguelRepository pedidoRepository;
    @Mock AutomovelService automovelService;
    @Mock UsuarioLogado usuarioLogado;
    @InjectMocks PedidoService pedidoService;

    private final LocalDate inicio = LocalDate.now().plusDays(2);
    private final LocalDate fim = inicio.plusDays(3);

    private Cliente cliente(long id) {
        Cliente c = new Cliente();
        c.setId(id);
        return c;
    }

    private Automovel automovel() {
        Automovel a = new Automovel();
        a.setId(5L);
        return a;
    }

    @Test
    @DisplayName("Não cria pedido se o automóvel já está reservado no período")
    void conflitoDeDatas() {
        when(usuarioLogado.get()).thenReturn(cliente(1L));
        when(automovelService.buscarEntidade(5L)).thenReturn(automovel());
        when(pedidoRepository.existeConflito(eq(5L), eq(inicio), eq(fim), anyCollection(), anyLong())).thenReturn(true);

        assertThatThrownBy(() -> pedidoService.criar(new PedidoRequest(5L, inicio, fim)))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("reservado");
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Não cria pedido com início no passado")
    void inicioNoPassado() {
        when(usuarioLogado.get()).thenReturn(cliente(1L));
        assertThatThrownBy(() -> pedidoService.criar(new PedidoRequest(5L, LocalDate.now().minusDays(1), fim)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Agente não pode criar pedido")
    void agenteNaoCriaPedido() {
        when(usuarioLogado.get()).thenReturn(new Empresa());
        assertThatThrownBy(() -> pedidoService.criar(new PedidoRequest(5L, inicio, fim)))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Cliente só modifica pedidos pendentes")
    void clienteNaoModificaAprovado() {
        Cliente cliente = cliente(1L);
        PedidoAluguel pedido = PedidoAluguel.novo(cliente, automovel(), inicio, fim);
        pedido.aprovar(new Empresa(), "ok");
        when(usuarioLogado.get()).thenReturn(cliente);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> pedidoService.modificar(10L, new PedidoRequest(5L, inicio, fim.plusDays(1))))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Cliente não acessa pedido de outro cliente")
    void clienteNaoAcessaPedidoAlheio() {
        PedidoAluguel pedido = PedidoAluguel.novo(cliente(1L), automovel(), inicio, fim);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));
        when(usuarioLogado.get()).thenReturn(cliente(2L));

        assertThatThrownBy(() -> pedidoService.buscar(10L)).isInstanceOf(AccessDeniedException.class);
    }
}
