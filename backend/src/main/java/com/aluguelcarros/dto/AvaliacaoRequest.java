package com.aluguelcarros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequest(
        @NotNull(message = "Informe se o pedido foi aprovado") Boolean aprovado,
        @NotBlank(message = "Informe o parecer") @Size(max = 500, message = "O parecer deve ter no máximo 500 caracteres") String parecer) {
}
