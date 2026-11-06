import {
  Car,
  ChevronsUpDown,
  ClipboardList,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Plus,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '../context/useAuth';
import { PERFIS, ehAgente } from '../utils/perfis';

const MENU_CLIENTE = [
  { to: '/', rotulo: 'Início', Icone: LayoutDashboard },
  { to: '/pedidos', rotulo: 'Meus pedidos', Icone: ClipboardList },
  { to: '/contratos', rotulo: 'Contratos', Icone: FileSignature },
  { to: '/meus-dados', rotulo: 'Meus dados', Icone: UserRound },
];
const MENU_AGENTE = [
  { to: '/', rotulo: 'Início', Icone: LayoutDashboard },
  { to: '/pedidos', rotulo: 'Pedidos', Icone: ClipboardList },
  { to: '/contratos', rotulo: 'Contratos', Icone: FileSignature },
  { to: '/automoveis', rotulo: 'Automóveis', Icone: Car },
  { to: '/clientes', rotulo: 'Clientes', Icone: Users },
];

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

/** Item do menu cujo caminho mais longo corresponde à URL atual. */
function itemAtivo(menu, pathname) {
  return menu
    .filter((i) => (i.to === '/' ? pathname === '/' : pathname === i.to || pathname.startsWith(`${i.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

/** Item de navegação; no celular fecha a gaveta ao navegar. */
function ItemMenu({ to, rotulo, Icone, ativo }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={ativo} tooltip={rotulo}>
        <NavLink to={to} end={to === '/'} onClick={() => setOpenMobile(false)}>
          <Icone />
          <span>{rotulo}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function MenuUsuario({ usuario, onSair }) {
  const { isMobile } = useSidebar();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              {iniciais(usuario.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{usuario.nome}</span>
            <span className="truncate text-xs text-muted-foreground">{PERFIS[usuario.perfil]}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side={isMobile ? 'top' : 'right'} align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium text-foreground">{usuario.nome}</div>
          <div className="text-xs text-muted-foreground">{usuario.login} · {PERFIS[usuario.perfil]}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onSair}>
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const agente = ehAgente(usuario.perfil);
  const menu = agente ? MENU_AGENTE : MENU_CLIENTE;
  const ativo = itemAtivo(menu, pathname);

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="AluguelCarros">
                <NavLink to="/">
                  <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Car className="size-4" />
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">AluguelCarros</span>
                    <span className="truncate text-xs text-muted-foreground">Gestão de aluguéis</span>
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.map((item) => (
                  <ItemMenu key={item.to} {...item} ativo={ativo?.to === item.to && pathname !== '/pedidos/novo'} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {!agente && (
            <SidebarGroup>
              <SidebarGroupLabel>Ações</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <ItemMenu to="/pedidos/novo" rotulo="Novo pedido" Icone={Plus} ativo={pathname === '/pedidos/novo'} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <MenuUsuario usuario={usuario} onSair={sair} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm font-medium">{pathname === '/pedidos/novo' ? 'Novo pedido' : ativo?.rotulo ?? 'AluguelCarros'}</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
