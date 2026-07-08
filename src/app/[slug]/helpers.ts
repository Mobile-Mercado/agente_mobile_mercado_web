import { normalizar } from "@/lib/productSearch";

export function nomeEhPadraoDoSistema(nome: string | null | undefined): boolean {
  const n = normalizar(String(nome ?? '')).trim();
  return !n || n === 'cliente' || n === 'convidado';
}
