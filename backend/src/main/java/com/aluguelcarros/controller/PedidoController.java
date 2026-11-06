package com.aluguelcarros.controller;

import com.aluguelcarros.dto.AvaliacaoRequest;
import com.aluguelcarros.dto.ContratoRequest;
import com.aluguelcarros.dto.PedidoRequest;
import com.aluguelcarros.dto.PedidoResponse;
import com.aluguelcarros.service.ContratoService;
import com.aluguelcarros.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final ContratoService contratoService;

    @GetMapping
    public List<PedidoResponse> listar() {
        return pedidoService.listar();
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@PathVariable Long id) {
        return pedidoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoResponse criar(@Valid @RequestBody PedidoRequest req) {
        return pedidoService.criar(req);
    }

    @PutMapping("/{id}")
    public PedidoResponse modificar(@PathVariable Long id, @Valid @RequestBody PedidoRequest req) {
        return pedidoService.modificar(id, req);
    }

    @PostMapping("/{id}/cancelamento")
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoResponse cancelar(@PathVariable Long id) {
        return pedidoService.cancelar(id);
    }

    @PostMapping("/{id}/avaliacao")
    @PreAuthorize("hasAnyRole('EMPRESA', 'BANCO')")
    public PedidoResponse avaliar(@PathVariable Long id, @Valid @RequestBody AvaliacaoRequest req) {
        return pedidoService.avaliar(id, req);
    }

    @PostMapping("/{id}/contrato")
    @PreAuthorize("hasAnyRole('EMPRESA', 'BANCO')")
    public PedidoResponse executarContrato(@PathVariable Long id, @Valid @RequestBody ContratoRequest req) {
        return contratoService.executar(id, req);
    }
}
