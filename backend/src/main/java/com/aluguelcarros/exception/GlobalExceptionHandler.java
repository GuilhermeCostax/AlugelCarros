package com.aluguelcarros.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException e) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(RecursoNaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> credenciaisInvalidas(BadCredentialsException e) {
        return resposta(HttpStatus.UNAUTHORIZED, "Login ou senha inválidos.");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AccessDeniedException e) {
        return resposta(HttpStatus.FORBIDDEN, "Você não tem permissão para esta operação.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException e) {
        Map<String, String> erros = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(f -> erros.putIfAbsent(f.getField(), f.getDefaultMessage()));
        ErroResponse corpo = new ErroResponse(400, "Dados inválidos.", erros, LocalDateTime.now());
        return ResponseEntity.badRequest().body(corpo);
    }

    private ResponseEntity<ErroResponse> resposta(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(new ErroResponse(status.value(), mensagem));
    }
}
