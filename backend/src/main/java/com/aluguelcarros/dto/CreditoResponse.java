package com.aluguelcarros.dto;

import com.aluguelcarros.model.ContratoCredito;

import java.math.BigDecimal;

public record CreditoResponse(Long id, UsuarioResumo banco, BigDecimal valor, BigDecimal taxaJuros,
                              int numeroParcelas, BigDecimal valorParcela) {

    public static CreditoResponse de(ContratoCredito c) {
        return c == null ? null : new CreditoResponse(c.getId(), UsuarioResumo.de(c.getBanco()), c.getValor(),
                c.getTaxaJuros(), c.getNumeroParcelas(), c.getValorParcela());
    }
}
