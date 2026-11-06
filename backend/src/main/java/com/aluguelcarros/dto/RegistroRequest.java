package com.aluguelcarros.dto;

import com.aluguelcarros.model.Perfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;
import org.hibernate.validator.constraints.br.CPF;

/**
 * Cadastro de usuário. Campos de cliente (rg, cpf, endereco, profissao) são obrigatórios
 * para o perfil CLIENTE; o cnpj é obrigatório para EMPRESA e BANCO.
 */
public record RegistroRequest(
        @NotNull(message = "Escolha o perfil") Perfil perfil,
        @NotBlank(message = "Informe o login") @Size(min = 3, max = 60, message = "O login deve ter entre 3 e 60 caracteres") String login,
        @NotBlank(message = "Informe a senha") @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres") String senha,
        @NotBlank(message = "Informe o nome") @Size(max = 120) String nome,
        @Size(max = 20) String rg,
        @CPF(message = "CPF inválido") String cpf,
        @Size(max = 200) String endereco,
        @Size(max = 80) String profissao,
        @CNPJ(message = "CNPJ inválido") String cnpj) {
}
