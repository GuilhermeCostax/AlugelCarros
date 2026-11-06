package com.aluguelcarros.dto;

import com.aluguelcarros.model.Automovel;

public record AutomovelResponse(Long id, String matricula, int ano, String marca, String modelo, String placa,
                                UsuarioResumo proprietario) {

    public static AutomovelResponse de(Automovel a) {
        return new AutomovelResponse(a.getId(), a.getMatricula(), a.getAno(), a.getMarca(), a.getModelo(),
                a.getPlaca(), UsuarioResumo.de(a.getProprietario()));
    }
}
