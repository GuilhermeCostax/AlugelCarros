package com.aluguelcarros.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreditoRequest(
        @NotNull(message = "Informe o valor") @Positive(message = "O valor deve ser maior que zero") BigDecimal valor,
        @NotNull(message = "Informe a taxa de juros") @DecimalMin(value = "0", message = "Taxa inválida")
        @DecimalMax(value = "100", message = "Taxa inválida") BigDecimal taxaJuros,
        @NotNull(message = "Informe o número de parcelas") @Min(value = 1, message = "Mínimo de 1 parcela")
        @Max(value = 120, message = "Máximo de 120 parcelas") Integer numeroParcelas) {
}
