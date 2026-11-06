package com.aluguelcarros.dto;

import jakarta.validation.constraints.*;

public record AutomovelRequest(
        @NotBlank(message = "Informe a matrícula") @Size(max = 30) String matricula,
        @NotNull(message = "Informe o ano") @Min(value = 1950, message = "Ano inválido") @Max(value = 2100, message = "Ano inválido") Integer ano,
        @NotBlank(message = "Informe a marca") @Size(max = 60) String marca,
        @NotBlank(message = "Informe o modelo") @Size(max = 60) String modelo,
        @NotBlank(message = "Informe a placa")
        @Pattern(regexp = "(?i)^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$", message = "Placa inválida (ex.: ABC-1234 ou ABC1D23)")
        String placa) {
}
