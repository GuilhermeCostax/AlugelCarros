package com.aluguelcarros.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contrato")
@Getter
@Setter
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private PedidoAluguel pedido;

    /** Agente que executou o contrato. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_id")
    private Agente agente;

    @Column(name = "data_assinatura", nullable = false)
    private LocalDate dataAssinatura;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_proprietario", nullable = false, length = 20)
    private TipoProprietario tipoProprietario;

    @OneToOne(mappedBy = "contrato", fetch = FetchType.LAZY)
    private ContratoCredito credito;
}
