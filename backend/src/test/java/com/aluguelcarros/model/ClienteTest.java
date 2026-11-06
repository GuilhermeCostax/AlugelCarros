package com.aluguelcarros.model;

import com.aluguelcarros.exception.RegraNegocioException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ClienteTest {

    @Test
    @DisplayName("Cliente aceita no máximo 3 rendimentos")
    void maximoTresRendimentos() {
        Cliente cliente = new Cliente();
        cliente.adicionarRendimento(new Rendimento("A", new BigDecimal("1000")));
        cliente.adicionarRendimento(new Rendimento("B", new BigDecimal("2000")));
        cliente.adicionarRendimento(new Rendimento("C", new BigDecimal("500.50")));

        assertThatThrownBy(() -> cliente.adicionarRendimento(new Rendimento("D", BigDecimal.ONE)))
                .isInstanceOf(RegraNegocioException.class);
        assertThat(cliente.getRendimentos()).hasSize(3);
    }

    @Test
    @DisplayName("Renda total soma todos os rendimentos")
    void rendaTotal() {
        Cliente cliente = new Cliente();
        assertThat(cliente.getRendaTotal()).isEqualByComparingTo("0");
        cliente.adicionarRendimento(new Rendimento("A", new BigDecimal("1000")));
        cliente.adicionarRendimento(new Rendimento("B", new BigDecimal("2500.75")));
        assertThat(cliente.getRendaTotal()).isEqualByComparingTo("3500.75");
    }

    @Test
    @DisplayName("Rendimento adicionado fica vinculado ao cliente")
    void vinculo() {
        Cliente cliente = new Cliente();
        Rendimento r = new Rendimento("A", BigDecimal.TEN);
        cliente.adicionarRendimento(r);
        assertThat(r.getCliente()).isSameAs(cliente);
        cliente.removerRendimento(r);
        assertThat(r.getCliente()).isNull();
        assertThat(cliente.getRendimentos()).isEmpty();
    }

    @Test
    @DisplayName("Perfis de cada tipo de usuário")
    void perfis() {
        assertThat(new Cliente().getPerfil()).isEqualTo(Perfil.CLIENTE);
        assertThat(new Empresa().getPerfil()).isEqualTo(Perfil.EMPRESA);
        assertThat(new Banco().getPerfil()).isEqualTo(Perfil.BANCO);
    }
}
