package com.aluguelcarros.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PedidoRequest(
        @NotNull(message = "Escolha o automóvel") Long automovelId,
        @NotNull(message = "Informe a data de início") LocalDate dataInicio,
        @NotNull(message = "Informe a data de fim") LocalDate dataFim) {
}
