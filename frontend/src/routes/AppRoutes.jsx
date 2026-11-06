import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ClienteEditar from '../pages/ClienteEditar';
import Clientes from '../pages/Clientes';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MeusDados from '../pages/MeusDados';
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

            <Route element={<RotaProtegida perfis={['CLIENTE']} />}>
              <Route path="/meus-dados" element={<MeusDados />} />
            </Route>

            <Route element={<RotaProtegida perfis={['EMPRESA', 'BANCO']} />}>
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
