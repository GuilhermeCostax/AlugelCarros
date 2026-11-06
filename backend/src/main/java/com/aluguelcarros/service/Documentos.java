package com.aluguelcarros.service;

import com.aluguelcarros.exception.RegraNegocioException;

/** Utilitários para normalizar documentos (CPF, RG, CNPJ). */
final class Documentos {

    private Documentos() {
    }

    static String somenteDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    static String normalizarRg(String rg) {
        return rg == null ? null : rg.replaceAll("[^0-9A-Za-z]", "").toUpperCase();
    }

    static void exigir(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new RegraNegocioException(mensagem);
        }
    }
}
