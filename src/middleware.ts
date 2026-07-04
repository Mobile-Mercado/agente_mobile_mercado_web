import { NextRequest, NextResponse } from "next/server";

const BYPASS = ["/_next", "/api", "/favicon", "/logo", "/prodSemImg"];

// Dominio canonico do app. O dominio padrao do Render (*.onrender.com) continua
// acessivel mesmo depois de configurar um dominio proprio. Manter um unico
// dominio canonico evita depender de manter duas listas de dominios
// autorizados (Firebase Auth + chave do reCAPTCHA) sempre sincronizadas.
const CANONICAL_HOST = "agentemercado.com.br";

// Domínios raiz que NÃO são slugs (adicione todos os seus domínios aqui)
const ROOT_DOMAINS = [
  "agentemercado.com.br",
  "mobilemercado.com.br",
  "agentemercado.com.br",
  "localhost",
];

function extractSlugFromHost(host: string): string | null {
  // Remove porta se houver (ex: localhost:3000)
  const hostname = host.split(":")[0];

  // Verifica se é um subdomínio de algum domínio raiz
  for (const root of ROOT_DOMAINS) {
    if (hostname.endsWith(`.${root}`)) {
      const subdomain = hostname.slice(0, hostname.length - root.length - 1);
      // Ignora www
      if (subdomain && subdomain !== "www") return subdomain;
    }
  }

  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  const hasExtension = /\.\w{2,5}$/.test(pathname);
  if (hasExtension || BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hostname = host.split(":")[0];
  if (hostname.endsWith(".onrender.com")) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const slug = extractSlugFromHost(host);

  // Se não tem subdomínio válido, segue normalmente
  if (!slug) return NextResponse.next();

  // Evita loop: se o path já começa com o slug, não reescreve
  if (pathname.startsWith(`/${slug}`)) return NextResponse.next();

  // Reescreve internamente: /login → /mercadojose/login
  const url = req.nextUrl.clone();
  url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
