package com.aluguelcarros.repository;

import com.aluguelcarros.model.Agente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgenteRepository extends JpaRepository<Agente, Long> {

    boolean existsByCnpj(String cnpj);
}
