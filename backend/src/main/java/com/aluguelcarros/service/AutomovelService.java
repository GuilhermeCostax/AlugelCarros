package com.aluguelcarros.service;

import com.aluguelcarros.dto.AutomovelRequest;
import com.aluguelcarros.dto.AutomovelResponse;
import com.aluguelcarros.exception.RecursoNaoEncontradoException;
import com.aluguelcarros.exception.RegraNegocioException;
import com.aluguelcarros.model.Automovel;
import com.aluguelcarros.repository.AutomovelRepository;
import com.aluguelcarros.repository.PedidoAluguelRepository;
import com.aluguelcarros.security.UsuarioLogado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AutomovelService {

    private final AutomovelRepository automovelRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final UsuarioLogado usuarioLogado;

    @Transactional(readOnly = true)
    public List<AutomovelResponse> listar() {
        return automovelRepository.findAllByOrderByMarcaAscModeloAsc().stream().map(AutomovelResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public AutomovelResponse buscar(Long id) {
        return AutomovelResponse.de(buscarEntidade(id));
    }

    /** O automóvel é registrado inicialmente em nome do agente que o cadastrou. */
    @Transactional
    public AutomovelResponse criar(AutomovelRequest req) {
        Automovel automovel = new Automovel();
        automovel.setProprietario(usuarioLogado.get());
        preencher(automovel, req);
        return AutomovelResponse.de(automovelRepository.save(automovel));
    }

    @Transactional
    public AutomovelResponse atualizar(Long id, AutomovelRequest req) {
        Automovel automovel = buscarEntidade(id);
        preencher(automovel, req);
        return AutomovelResponse.de(automovel);
    }

    @Transactional
    public void excluir(Long id) {
        Automovel automovel = buscarEntidade(id);
        if (pedidoRepository.existsByAutomovelId(id)) {
            throw new RegraNegocioException("Este automóvel possui pedidos de aluguel e não pode ser excluído.");
        }
        automovelRepository.delete(automovel);
    }

    Automovel buscarEntidade(Long id) {
        return automovelRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Automóvel não encontrado."));
    }

    private void preencher(Automovel automovel, AutomovelRequest req) {
        String matricula = req.matricula().trim().toUpperCase();
        String placa = req.placa().replace("-", "").trim().toUpperCase();
        boolean novo = automovel.getId() == null;
        if (novo ? automovelRepository.existsByMatricula(matricula)
                : automovelRepository.existsByMatriculaAndIdNot(matricula, automovel.getId())) {
            throw new RegraNegocioException("Já existe um automóvel com esta matrícula.");
        }
        if (novo ? automovelRepository.existsByPlaca(placa)
                : automovelRepository.existsByPlacaAndIdNot(placa, automovel.getId())) {
            throw new RegraNegocioException("Já existe um automóvel com esta placa.");
        }
        automovel.setMatricula(matricula);
        automovel.setPlaca(placa);
        automovel.setAno(req.ano());
        automovel.setMarca(req.marca().trim());
        automovel.setModelo(req.modelo().trim());
    }
}
