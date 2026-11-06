package com.aluguelcarros.dto;

import com.aluguelcarros.model.PedidoAluguel;
import com.aluguelcarros.model.StatusPedido;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public record PedidoResponse(Long id, StatusPedido status, LocalDateTime dataCriacao, LocalDate dataInicio,
                             LocalDate dataFim, long diarias, ClienteResponse cliente, AutomovelResponse automovel,
                             String parecer, LocalDateTime dataAvaliacao, UsuarioResumo agenteAvaliador,
                             ContratoResponse contrato) {

    public static PedidoResponse de(PedidoAluguel p) {
        return new PedidoResponse(p.getId(), p.getStatus(), p.getDataCriacao(), p.getDataInicio(), p.getDataFim(),
                ChronoUnit.DAYS.between(p.getDataInicio(), p.getDataFim()), ClienteResponse.de(p.getCliente()),
                AutomovelResponse.de(p.getAutomovel()), p.getParecer(), p.getDataAvaliacao(),
                UsuarioResumo.de(p.getAgenteAvaliador()), ContratoResponse.de(p.getContrato()));
    }
}
