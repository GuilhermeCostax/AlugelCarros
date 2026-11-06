package com.aluguelcarros.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

@Entity
@Table(name = "contrato_credito")
@Getter
@Setter
public class ContratoCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contrato_id", nullable = false, unique = true)
    private Contrato contrato;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    /** Taxa de juros mensal, em percentual (ex.: 1.5 = 1,5% a.m.). */
    @Column(name = "taxa_juros", nullable = false, precision = 6, scale = 3)
    private BigDecimal taxaJuros;

    @Column(name = "numero_parcelas", nullable = false)
    private int numeroParcelas;

    /** Valor da parcela pela Tabela Price: PMT = V·i / (1 − (1 + i)^−n). */
    public BigDecimal getValorParcela() {
        BigDecimal n = BigDecimal.valueOf(numeroParcelas);
        if (taxaJuros.signum() == 0) {
            return valor.divide(n, 2, RoundingMode.HALF_UP);
        }
        MathContext mc = MathContext.DECIMAL64;
        BigDecimal i = taxaJuros.divide(BigDecimal.valueOf(100), mc);
        BigDecimal fator = BigDecimal.ONE.add(i).pow(numeroParcelas, mc);
        return valor.multiply(i, mc).multiply(fator, mc)
                .divide(fator.subtract(BigDecimal.ONE), mc)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
