package com.aluguelcarros.repository;

import com.aluguelcarros.model.PedidoAluguel;
import com.aluguelcarros.model.StatusPedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface PedidoAluguelRepository extends JpaRepository<PedidoAluguel, Long> {

    @EntityGraph(attributePaths = {"cliente", "automovel", "agenteAvaliador"})
    List<PedidoAluguel> findAllByOrderByDataCriacaoDesc();

    @EntityGraph(attributePaths = {"cliente", "automovel", "agenteAvaliador"})
    List<PedidoAluguel> findByClienteIdOrderByDataCriacaoDesc(Long clienteId);

    boolean existsByClienteIdAndStatus(Long clienteId, StatusPedido status);

    boolean existsByAutomovelId(Long automovelId);

    /** Verifica se o automóvel já está reservado (pedido ativo) em um período que se sobrepõe ao informado. */
    @Query("""
            select count(p) > 0 from PedidoAluguel p
            where p.automovel.id = :automovelId
              and p.id <> :ignorarPedidoId
              and p.status in :status
              and p.dataInicio < :fim
              and p.dataFim > :inicio
            """)
    boolean existeConflito(@Param("automovelId") Long automovelId,
                           @Param("inicio") LocalDate inicio,
                           @Param("fim") LocalDate fim,
                           @Param("status") Collection<StatusPedido> status,
                           @Param("ignorarPedidoId") Long ignorarPedidoId);
}
