package com.aluguelcarros.model;

import com.aluguelcarros.exception.RegraNegocioException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "cliente")
@DiscriminatorValue("CLIENTE")
@Getter
@Setter
public class Cliente extends Usuario {

    public static final int MAX_RENDIMENTOS = 3;

    @Column(nullable = false, unique = true, length = 20)
    private String rg;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false, length = 200)
    private String endereco;

    @Column(nullable = false, length = 80)
    private String profissao;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    @Setter(lombok.AccessLevel.NONE)
    private List<Rendimento> rendimentos = new ArrayList<>();

    @Override
    public Perfil getPerfil() {
        return Perfil.CLIENTE;
    }

    public List<Rendimento> getRendimentos() {
        return Collections.unmodifiableList(rendimentos);
    }

    public void adicionarRendimento(Rendimento rendimento) {
        if (rendimentos.size() >= MAX_RENDIMENTOS) {
            throw new RegraNegocioException("O cliente pode ter no máximo " + MAX_RENDIMENTOS + " rendimentos.");
        }
        rendimento.setCliente(this);
        rendimentos.add(rendimento);
    }

    public void removerRendimento(Rendimento rendimento) {
        rendimentos.remove(rendimento);
        rendimento.setCliente(null);
    }

    public void limparRendimentos() {
        rendimentos.forEach(r -> r.setCliente(null));
        rendimentos.clear();
    }

    public BigDecimal getRendaTotal() {
        return rendimentos.stream()
                .map(Rendimento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
