import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
