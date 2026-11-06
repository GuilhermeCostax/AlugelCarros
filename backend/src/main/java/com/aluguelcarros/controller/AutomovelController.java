package com.aluguelcarros.controller;

import com.aluguelcarros.dto.AutomovelRequest;
import com.aluguelcarros.dto.AutomovelResponse;
import com.aluguelcarros.service.AutomovelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automoveis")
@RequiredArgsConstructor
public class AutomovelController {

    private final AutomovelService automovelService;

    @GetMapping
    public List<AutomovelResponse> listar() {
        return automovelService.listar();
    }

    @GetMapping("/{id}")
    public AutomovelResponse buscar(@PathVariable Long id) {
        return automovelService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('EMPRESA', 'BANCO')")
    public AutomovelResponse criar(@Valid @RequestBody AutomovelRequest req) {
        return automovelService.criar(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPRESA', 'BANCO')")
    public AutomovelResponse atualizar(@PathVariable Long id, @Valid @RequestBody AutomovelRequest req) {
        return automovelService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('EMPRESA', 'BANCO')")
    public void excluir(@PathVariable Long id) {
        automovelService.excluir(id);
    }
}
