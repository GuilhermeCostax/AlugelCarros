import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useAuth } from '../context/useAuth';
import { PERFIS, ehAgente } from '../utils/perfis';

const MENU_CLIENTE = [
  { to: '/pedidos', rotulo: 'Meus pedidos' },
  { to: '/contratos', rotulo: 'Contratos' },
  { to: '/meus-dados', rotulo: 'Meus dados' },
];
const MENU_AGENTE = [
  { to: '/pedidos', rotulo: 'Pedidos' },
  { to: '/contratos', rotulo: 'Contratos' },
  { to: '/automoveis', rotulo: 'Automóveis' },
  { to: '/clientes', rotulo: 'Clientes' },
];

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const menu = [{ to: '/', rotulo: 'Início', end: true }, ...(ehAgente(usuario.perfil) ? MENU_AGENTE : MENU_CLIENTE)];

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <NavLink to="/" aria-label="Início">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {item.rotulo}
              </NavLink>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto h-9 gap-2 px-2" aria-label="Menu do usuário">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {iniciais(usuario.nome)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{usuario.nome}</span>
                <Badge variant="secondary" className="hidden sm:inline-flex">{PERFIS[usuario.perfil]}</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium text-foreground">{usuario.nome}</div>
                <div className="text-xs text-muted-foreground">{usuario.login} · {PERFIS[usuario.perfil]}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuGroup className="md:hidden">
                {menu.map((item) => (
                  <DropdownMenuItem key={item.to} onSelect={() => navigate(item.to)}>
                    {item.rotulo}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={sair}>
                <LogOut /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
