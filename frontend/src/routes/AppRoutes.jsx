import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Automoveis from '../pages/Automoveis';
import ClienteEditar from '../pages/ClienteEditar';
import Clientes from '../pages/Clientes';
import Contratos from '../pages/Contratos';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MeusDados from '../pages/MeusDados';
import PedidoDetalhe from '../pages/PedidoDetalhe';
import PedidoForm from '../pages/PedidoForm';
import Pedidos from '../pages/Pedidos';
import Registro from '../pages/Registro';
import RotaProtegida from './RotaProtegida';
import RotaPublica from './RotaPublica';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RotaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>

        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/:id" element={<PedidoDetalhe />} />
            <Route path="/pedidos/:id/editar" element={<PedidoForm />} />
            <Route path="/contratos" element={<Contratos />} />

            <Route element={<RotaProtegida perfis={['CLIENTE']} />}>
              <Route path="/meus-dados" element={<MeusDados />} />
              <Route path="/pedidos/novo" element={<PedidoForm />} />
            </Route>

            <Route element={<RotaProtegida perfis={['EMPRESA', 'BANCO']} />}>
              <Route path="/automoveis" element={<Automoveis />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/novo" element={<ClienteEditar />} />
              <Route path="/clientes/:id/editar" element={<ClienteEditar />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
