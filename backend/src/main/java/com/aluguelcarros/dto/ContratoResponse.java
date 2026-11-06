package com.aluguelcarros.dto;

import com.aluguelcarros.model.Contrato;
import com.aluguelcarros.model.TipoProprietario;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContratoResponse(Long id, Long pedidoId, String cliente, String automovel, LocalDate dataAssinatura,
                               BigDecimal valorTotal, TipoProprietario tipoProprietario, UsuarioResumo proprietario,
                               UsuarioResumo agente, CreditoResponse credito) {

    public static ContratoResponse de(Contrato c) {
        if (c == null) return null;
        var pedido = c.getPedido();
        var automovel = pedido.getAutomovel();
        return new ContratoResponse(c.getId(), pedido.getId(), pedido.getCliente().getNome(),
                automovel.getDescricao() + " (" + automovel.getPlaca() + ")", c.getDataAssinatura(), c.getValorTotal(),
                c.getTipoProprietario(), UsuarioResumo.de(automovel.getProprietario()), UsuarioResumo.de(c.getAgente()),
                CreditoResponse.de(c.getCredito()));
    }
}
