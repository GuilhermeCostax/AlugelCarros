import { moeda } from '../utils/formatos';

export const MAX_RENDIMENTOS = 3;

/** Lista editável de rendimentos (entidade empregadora + valor), com no máximo 3 itens. */
export default function RendimentosEditor({ rendimentos, onChange }) {
  const alterar = (indice, campo, valor) =>
    onChange(rendimentos.map((r, i) => (i === indice ? { ...r, [campo]: valor } : r)));

  const adicionar = () => onChange([...rendimentos, { entidadeEmpregadora: '', valor: '' }]);
  const remover = (indice) => onChange(rendimentos.filter((_, i) => i !== indice));

  const total = rendimentos.reduce((soma, r) => soma + (Number(r.valor) || 0), 0);

  return (
    <fieldset className="rendimentos">
      <legend>Empregadores e rendimentos <small>(máximo {MAX_RENDIMENTOS})</small></legend>

      {rendimentos.length === 0 && <p className="vazio">Nenhum rendimento informado.</p>}

      {rendimentos.map((r, i) => (
        <div className="rendimento-linha" key={i}>
          <input
            aria-label={`Entidade empregadora ${i + 1}`}
            placeholder="Entidade empregadora"
            value={r.entidadeEmpregadora}
            onChange={(e) => alterar(i, 'entidadeEmpregadora', e.target.value)}
            required
          />
          <input
            aria-label={`Valor do rendimento ${i + 1}`}
            placeholder="Valor (R$)"
            type="number"
            min="0.01"
            step="0.01"
            value={r.valor}
            onChange={(e) => alterar(i, 'valor', e.target.value)}
            required
          />
          <button type="button" className="btn btn-perigo btn-sm" onClick={() => remover(i)}>Remover</button>
        </div>
      ))}

      <div className="rendimentos-rodape">
        <button
          type="button"
          className="btn btn-secundario btn-sm"
          onClick={adicionar}
          disabled={rendimentos.length >= MAX_RENDIMENTOS}
        >
          + Adicionar rendimento
        </button>
        <span>Renda total: <strong>{moeda(total)}</strong></span>
      </div>
    </fieldset>
  );
}
