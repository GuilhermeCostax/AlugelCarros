package com.aluguelcarros.dto;

import com.aluguelcarros.model.TipoProprietario;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ContratoRequest(
        @NotNull(message = "Informe em nome de quem o automóvel será registrado") TipoProprietario tipoProprietario,
        @NotNull(message = "Informe o valor total") @Positive(message = "O valor total deve ser maior que zero") BigDecimal valorTotal) {
}
