package com.aluguelcarros.dto;

import com.aluguelcarros.model.Cliente;

import java.math.BigDecimal;
import java.util.List;

public record ClienteResponse(
        Long id,
        String login,
        String nome,
        String rg,
        String cpf,
        String endereco,
        String profissao,
        List<RendimentoDTO> rendimentos,
        BigDecimal rendaTotal) {

    public static ClienteResponse de(Cliente c) {
        return new ClienteResponse(c.getId(), c.getLogin(), c.getNome(), c.getRg(), c.getCpf(),
                c.getEndereco(), c.getProfissao(),
                c.getRendimentos().stream().map(RendimentoDTO::de).toList(),
                c.getRendaTotal());
    }
}
