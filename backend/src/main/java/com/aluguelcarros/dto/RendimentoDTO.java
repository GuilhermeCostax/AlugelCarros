package com.aluguelcarros.dto;

import com.aluguelcarros.model.Rendimento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RendimentoDTO(
        Long id,
        @NotBlank(message = "Informe a entidade empregadora") @Size(max = 120) String entidadeEmpregadora,
        @NotNull(message = "Informe o valor do rendimento") @Positive(message = "O rendimento deve ser maior que zero") BigDecimal valor) {

    public static RendimentoDTO de(Rendimento r) {
        return new RendimentoDTO(r.getId(), r.getEntidadeEmpregadora(), r.getValor());
    }
}
