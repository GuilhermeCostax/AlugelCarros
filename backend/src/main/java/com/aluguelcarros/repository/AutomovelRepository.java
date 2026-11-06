package com.aluguelcarros.repository;

import com.aluguelcarros.model.Automovel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutomovelRepository extends JpaRepository<Automovel, Long> {

    @EntityGraph(attributePaths = "proprietario")
    List<Automovel> findAllByOrderByMarcaAscModeloAsc();

    boolean existsByMatricula(String matricula);

    boolean existsByPlaca(String placa);

    boolean existsByMatriculaAndIdNot(String matricula, Long id);

    boolean existsByPlacaAndIdNot(String placa, Long id);
}
