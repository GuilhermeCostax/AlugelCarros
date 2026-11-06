package com.aluguelcarros.controller;

import com.aluguelcarros.dto.ContratoResponse;
import com.aluguelcarros.dto.CreditoRequest;
import com.aluguelcarros.service.ContratoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contratos")
@RequiredArgsConstructor
public class ContratoController {

    private final ContratoService contratoService;

    @GetMapping
    public List<ContratoResponse> listar() {
        return contratoService.listar();
    }

    @PostMapping("/{id}/credito")
    @PreAuthorize("hasRole('BANCO')")
    public ContratoResponse concederCredito(@PathVariable Long id, @Valid @RequestBody CreditoRequest req) {
        return contratoService.concederCredito(id, req);
    }
}
