import { Ban, Check, Circle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { data, dataHora, moeda } from '../utils/formatos';

/** Monta as etapas do pedido: criação → análise → contrato → crédito (ou cancelamento). */
function etapas(pedido) {
  const { status, contrato } = pedido;
  const cancelado = status === 'CANCELADO';
  const lista = [
    { titulo: 'Pedido criado', detalhe: dataHora(pedido.dataCriacao), estado: 'feito' },
  ];

  if (pedido.dataAvaliacao) {
    const aprovado = status !== 'REPROVADO';
    lista.push({
      titulo: aprovado ? 'Aprovado' : 'Reprovado',
      detalhe: `${pedido.agenteAvaliador?.nome ?? 'Agente'} · ${dataHora(pedido.dataAvaliacao)}`,
      estado: aprovado ? 'feito' : 'erro',
    });
  } else {
    lista.push({
      titulo: 'Análise financeira',
      detalhe: cancelado ? 'Não realizada' : 'Aguardando parecer do agente',
      estado: cancelado ? 'pulado' : 'atual',
    });
  }

  if (contrato) {
    lista.push({
      titulo: 'Contrato executado',
      detalhe: `${moeda(contrato.valorTotal)} · ${data(contrato.dataAssinatura)}`,
      estado: 'feito',
    });
    lista.push(
      contrato.credito
        ? {
            titulo: 'Crédito concedido',
            detalhe: `${contrato.credito.numeroParcelas}x de ${moeda(contrato.credito.valorParcela)} · ${contrato.credito.banco.nome}`,
            estado: 'feito',
          }
        : { titulo: 'Crédito', detalhe: 'Opcional — nenhum crédito associado', estado: 'pulado' },
    );
  } else if (status === 'APROVADO') {
    lista.push({ titulo: 'Contrato', detalhe: 'Aguardando execução pelo agente', estado: 'atual' });
    lista.push({ titulo: 'Crédito', detalhe: 'Opcional', estado: 'pendente' });
  } else if (!cancelado && status !== 'REPROVADO') {
    lista.push({ titulo: 'Contrato', detalhe: 'Após a aprovação', estado: 'pendente' });
    lista.push({ titulo: 'Crédito', detalhe: 'Opcional', estado: 'pendente' });
  }

  if (cancelado) lista.push({ titulo: 'Pedido cancelado', detalhe: 'Cancelado pelo cliente', estado: 'cancelado' });
  return lista;
}

const ESTILOS = {
  feito: { Icone: Check, circulo: 'bg-primary text-primary-foreground border-primary', linha: 'bg-primary' },
  atual: { Icone: Clock, circulo: 'bg-amber-50 text-amber-600 border-amber-400 ring-4 ring-amber-100', linha: 'bg-border' },
  erro: { Icone: X, circulo: 'bg-red-600 text-white border-red-600', linha: 'bg-border' },
  cancelado: { Icone: Ban, circulo: 'bg-zinc-500 text-white border-zinc-500', linha: 'bg-border' },
  pulado: { Icone: Circle, circulo: 'bg-muted text-muted-foreground border-border', linha: 'bg-border' },
  pendente: { Icone: Circle, circulo: 'bg-background text-muted-foreground border-border border-dashed', linha: 'bg-border' },
};

export default function LinhaDoTempoPedido({ pedido }) {
  const lista = etapas(pedido);
  return (
    <ol className="grid gap-0 md:grid-flow-col md:auto-cols-fr">
      {lista.map((etapa, i) => {
        const { Icone, circulo, linha } = ESTILOS[etapa.estado];
        const ultima = i === lista.length - 1;
        return (
          <li key={etapa.titulo} className="relative flex gap-3 pb-6 md:flex-col md:gap-3 md:pr-4 md:pb-0">
            {!ultima && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-9 left-4 h-[calc(100%-2.5rem)] w-0.5 md:top-4 md:left-10 md:h-0.5 md:w-[calc(100%-3rem)]',
                  linha,
                )}
              />
            )}
            <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2', circulo)}>
              <Icone className="size-4" />
            </span>
            <div className="min-w-0">
              <div className={cn('text-sm font-medium', ['pendente', 'pulado'].includes(etapa.estado) && 'text-muted-foreground')}>
                {etapa.titulo}
              </div>
              <div className="text-xs text-muted-foreground">{etapa.detalhe}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
