package com.aluguelcarros.service;

import com.aluguelcarros.dto.ContratoRequest;
import com.aluguelcarros.dto.CreditoRequest;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.*;
import com.aluguelcarros.repository.ContratoCreditoRepository;
import com.aluguelcarros.repository.ContratoRepository;
import com.aluguelcarros.security.UsuarioLogado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContratoServiceTest {

    @Mock ContratoRepository contratoRepository;
    @Mock ContratoCreditoRepository creditoRepository;
    @Mock PedidoService pedidoService;
    @Mock UsuarioLogado usuarioLogado;
    @InjectMocks ContratoService contratoService;

    private Cliente cliente;
    private Automovel automovel;
    private PedidoAluguel pedido;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNome("Ana");
        automovel = new Automovel();
        automovel.setMarca("Honda");
        automovel.setModelo("Civic");
        automovel.setAno(2023);
        automovel.setPlaca("XYZ9876");
        pedido = PedidoAluguel.novo(cliente, automovel, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));
        pedido.setId(10L);
    }

    private Empresa empresa() {
        Empresa e = new Empresa();
        e.setId(2L);
        e.setNome("Locadora");
        return e;
    }

    private Banco banco() {
        Banco b = new Banco();
        b.setId(3L);
        b.setNome("Banco X");
        return b;
    }

    @Test
    @DisplayName("Executar contrato em nome do cliente registra o automóvel para o cliente")
    void executarEmNomeDoCliente() {
        Empresa empresa = empresa();
        pedido.aprovar(empresa, "ok");
        when(usuarioLogado.get()).thenReturn(empresa);
        when(pedidoService.buscarEntidade(10L)).thenReturn(pedido);
        when(contratoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var resposta = contratoService.executar(10L,
                new ContratoRequest(TipoProprietario.CLIENTE, new BigDecimal("1500")));

        assertThat(resposta.status()).isEqualTo(StatusPedido.CONTRATADO);
        assertThat(automovel.getProprietario()).isSameAs(cliente);
        assertThat(resposta.contrato().agente().nome()).isEqualTo("Locadora");
    }

    @Test
    @DisplayName("Empresa não pode registrar o automóvel em nome de um banco")
    void empresaNaoRegistraEmNomeDeBanco() {
        Empresa empresa = empresa();
        pedido.aprovar(empresa, "ok");
        when(usuarioLogado.get()).thenReturn(empresa);
        when(pedidoService.buscarEntidade(10L)).thenReturn(pedido);

        assertThatThrownBy(() -> contratoService.executar(10L,
                new ContratoRequest(TipoProprietario.BANCO, new BigDecimal("1500"))))
                .isInstanceOf(RegraNegocioException.class);
        verify(contratoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Apenas bancos concedem crédito")
    void somenteBancoConcedeCredito() {
        when(usuarioLogado.get()).thenReturn(empresa());
        assertThatThrownBy(() -> contratoService.concederCredito(1L,
                new CreditoRequest(new BigDecimal("100"), BigDecimal.ONE, 2)))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Crédito não pode superar o valor total do contrato")
    void creditoMaiorQueContrato() {
        Contrato contrato = new Contrato();
        contrato.setValorTotal(new BigDecimal("1000"));
        when(usuarioLogado.get()).thenReturn(banco());
        when(contratoRepository.findById(1L)).thenReturn(Optional.of(contrato));

        assertThatThrownBy(() -> contratoService.concederCredito(1L,
                new CreditoRequest(new BigDecimal("5000"), BigDecimal.ONE, 10)))
                .isInstanceOf(RegraNegocioException.class);
        verify(creditoRepository, never()).save(any());
    }
}
