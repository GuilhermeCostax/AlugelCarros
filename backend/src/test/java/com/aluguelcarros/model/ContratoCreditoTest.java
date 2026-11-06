package com.aluguelcarros.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ContratoCreditoTest {

    private ContratoCredito credito(String valor, String taxa, int parcelas) {
        ContratoCredito c = new ContratoCredito();
        c.setValor(new BigDecimal(valor));
        c.setTaxaJuros(new BigDecimal(taxa));
        c.setNumeroParcelas(parcelas);
        return c;
    }

    @Test
    @DisplayName("Parcela pela Tabela Price")
    void parcelaComJuros() {
        assertThat(credito("1200", "1.5", 12).getValorParcela()).isEqualByComparingTo("110.02");
        assertThat(credito("2000", "1.5", 12).getValorParcela()).isEqualByComparingTo("183.36");
    }

    @Test
    @DisplayName("Sem juros, a parcela é o valor dividido pelo número de parcelas")
    void parcelaSemJuros() {
        assertThat(credito("1200", "0", 12).getValorParcela()).isEqualByComparingTo("100.00");
    }
}
