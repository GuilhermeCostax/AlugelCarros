import api from './api';

export const listarPedidos = () => api.get('/pedidos').then((r) => r.data);
export const buscarPedido = (id) => api.get(`/pedidos/${id}`).then((r) => r.data);
export const criarPedido = (dados) => api.post('/pedidos', dados).then((r) => r.data);
export const modificarPedido = (id, dados) => api.put(`/pedidos/${id}`, dados).then((r) => r.data);
export const cancelarPedido = (id) => api.post(`/pedidos/${id}/cancelamento`).then((r) => r.data);
export const avaliarPedido = (id, dados) => api.post(`/pedidos/${id}/avaliacao`, dados).then((r) => r.data);
export const executarContrato = (id, dados) => api.post(`/pedidos/${id}/contrato`, dados).then((r) => r.data);
