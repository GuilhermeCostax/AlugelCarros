package com.aluguelcarros.controller;

import com.aluguelcarros.dto.AuthResponse;
import com.aluguelcarros.dto.LoginRequest;
import com.aluguelcarros.dto.RegistroRequest;
import com.aluguelcarros.dto.UsuarioResponse;
import com.aluguelcarros.security.UsuarioLogado;
import com.aluguelcarros.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UsuarioLogado usuarioLogado;

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registrar(@Valid @RequestBody RegistroRequest req) {
        return authService.registrar(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UsuarioResponse me() {
        return UsuarioResponse.de(usuarioLogado.get());
    }
}
