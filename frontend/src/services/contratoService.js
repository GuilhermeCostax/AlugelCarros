import api from './api';

export const listarContratos = () => api.get('/contratos').then((r) => r.data);
export const concederCredito = (id, dados) => api.post(`/contratos/${id}/credito`, dados).then((r) => r.data);
