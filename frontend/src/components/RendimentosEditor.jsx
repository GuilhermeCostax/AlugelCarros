import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="grid gap-3">
      {rendimentos.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum rendimento informado.
        </p>
      )}

      {rendimentos.map((r, i) => (
        <div className="grid grid-cols-[1fr_8rem_auto] gap-2 sm:grid-cols-[1fr_10rem_auto]" key={i}>
          <Input
            aria-label={`Entidade empregadora ${i + 1}`}
            placeholder="Entidade empregadora"
            value={r.entidadeEmpregadora}
            onChange={(e) => alterar(i, 'entidadeEmpregadora', e.target.value)}
            required
          />
          <Input
            aria-label={`Valor do rendimento ${i + 1}`}
            placeholder="Valor (R$)"
            type="number"
            min="0.01"
            step="0.01"
            value={r.valor}
            onChange={(e) => alterar(i, 'valor', e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => remover(i)}
            aria-label={`Remover rendimento ${i + 1}`}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={adicionar} disabled={rendimentos.length >= MAX_RENDIMENTOS}>
          <Plus /> Adicionar rendimento
        </Button>
        <span className="text-sm text-muted-foreground">
          Renda total: <span className="font-semibold text-foreground tabular-nums">{moeda(total)}</span>
        </span>
      </div>
    </div>
  );
}
