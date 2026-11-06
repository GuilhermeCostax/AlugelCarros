package com.aluguelcarros.repository;

import com.aluguelcarros.model.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @EntityGraph(attributePaths = "rendimentos")
    List<Cliente> findAllByOrderByNomeAsc();

    boolean existsByCpf(String cpf);

    boolean existsByRg(String rg);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    boolean existsByRgAndIdNot(String rg, Long id);
}
