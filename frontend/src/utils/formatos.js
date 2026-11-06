const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const moeda = (valor) => moedaFmt.format(Number(valor ?? 0));

export function cpf(valor = '') {
  const d = String(valor).replace(/\D/g, '');
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : valor;
}
