package com.aluguelcarros.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "rendimento")
@Getter
@Setter
@NoArgsConstructor
public class Rendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entidade_empregadora", nullable = false, length = 120)
    private String entidadeEmpregadora;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    public Rendimento(String entidadeEmpregadora, BigDecimal valor) {
        this.entidadeEmpregadora = entidadeEmpregadora;
        this.valor = valor;
    }
}
