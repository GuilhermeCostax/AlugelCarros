import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CabecalhoPagina({ titulo, descricao, voltar, acoes, extra }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        {voltar && (
          <Link
            to={voltar.to}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {voltar.rotulo}
          </Link>
        )}
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-semibold tracking-tight">
          {titulo}
          {extra}
        </h1>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
