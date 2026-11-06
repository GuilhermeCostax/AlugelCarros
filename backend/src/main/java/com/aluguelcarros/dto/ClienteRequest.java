package com.aluguelcarros.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.util.List;

/**
 * Dados para criar ou atualizar um cliente.
 * Login e senha são obrigatórios na criação; na atualização a senha é opcional (só troca se informada).
 */
public record ClienteRequest(
        @NotBlank(message = "Informe o nome") @Size(max = 120) String nome,
        @NotBlank(message = "Informe o RG") @Size(max = 20) String rg,
        @NotBlank(message = "Informe o CPF") @CPF(message = "CPF inválido") String cpf,
        @NotBlank(message = "Informe o endereço") @Size(max = 200) String endereco,
        @NotBlank(message = "Informe a profissão") @Size(max = 80) String profissao,
        @Size(max = 3, message = "Informe no máximo 3 rendimentos") List<@Valid RendimentoDTO> rendimentos,
        @Size(min = 3, max = 60, message = "O login deve ter entre 3 e 60 caracteres") String login,
        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres") String senha) {
}
