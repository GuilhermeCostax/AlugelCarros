const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const moeda = (valor) => moedaFmt.format(Number(valor ?? 0));

export function cpf(valor = '') {
  const d = String(valor).replace(/\D/g, '');
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : valor;
}

/** "2026-11-10" -> "10/11/2026" (sem conversão de fuso). */
export function data(valor) {
  if (!valor) return '—';
  const [a, m, d] = String(valor).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function dataHora(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function placa(valor = '') {
  return /^[A-Z]{3}\d{4}$/.test(valor) ? `${valor.slice(0, 3)}-${valor.slice(3)}` : valor;
}

/** Valor da parcela pela Tabela Price (taxa em % ao mês). */
export function parcelaPrice(valor, taxaPercentual, parcelas) {
  const v = Number(valor);
  const n = Number(parcelas);
  const i = Number(taxaPercentual) / 100;
  if (!v || !n) return 0;
  if (!i) return v / n;
  const fator = (1 + i) ** n;
  return (v * i * fator) / (fator - 1);
}

/** Data de hoje no formato yyyy-mm-dd (fuso local). */
export function hojeISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
