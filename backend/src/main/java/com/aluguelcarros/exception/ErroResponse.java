package com.aluguelcarros.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ErroResponse(int status, String mensagem, Map<String, String> erros, LocalDateTime timestamp) {

    public ErroResponse(int status, String mensagem) {
        this(status, mensagem, Map.of(), LocalDateTime.now());
    }
}
