import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Store, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Smile, 
  Car, 
  Calendar, 
  MessageCircle, 
  Mail, 
  Briefcase
} from 'lucide-react';
import styles from './termos.module.css';

export const metadata: Metadata = {
  title: 'Móbile Supermercados Online — Termos e Apresentação',
  description: 'Conheça o Móbile Supermercados Online, a plataforma de supermercados digitais da sua cidade.',
};

export default function TermosDeUsoPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Topo */}
      <header className={styles.topBar}>
        <div className={styles.brandWrap}>
          <div className={styles.brandLogo}>M</div>
          <div>
            <div className={styles.brandTitle}>Móbile Supermercados Online</div>
            <div className={styles.brandSub}>Marketplace &amp; Termos da Plataforma</div>
          </div>
        </div>

        <div>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Voltar à Loja</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className={styles.contentContainer}>
        {/* Hero Card */}
        <section className={styles.heroCard}>
          <div className={styles.badge}>
            <Store size={14} />
            <span>Supermercados Digitais</span>
          </div>

          <h1 className={styles.mainTitle}>MÓBILE SUPERMERCADOS ONLINE</h1>

          <p className={styles.heroSubtitle}>
            No <strong>Móbile Supermercados Online</strong> você encontra as melhores mercearias, padarias, açougues, hortifrutis e supermercados da sua cidade na palma de sua mão!
          </p>

          <p className={styles.leadText}>
            O Móbile é um aplicativo de supermercados digitais, ou seja, todos os supermercados têm seus produtos disponibilizados online através de uma plataforma de marketplace.
          </p>

          <p className={styles.leadText}>
            De forma rápida, você escolhe seus mercados favoritos e faz seus pedidos e compras com muita tranquilidade!
          </p>

          <p className={styles.leadText}>
            Todos os nossos parceiros estão prontos para organizar e entregar as suas compras do jeito que você gosta!
          </p>

          {/* Indicação com bônus */}
          <div className={styles.partnerBanner}>
            <ShoppingBag size={24} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className={styles.partnerBannerText}>
              <strong>Não encontrou seu mercado favorito?</strong> Que tal ganhar um mega bônus indicando ele pra nós? Basta enviar um e-mail para:{" "}
              <a href="mailto:mobile@mobilesupermercados.com.br">mobile@mobilesupermercados.com.br</a>
            </div>
          </div>
        </section>

        {/* Motivos */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Principais Motivos para Usar o Móbile Supermercados</h2>
          <p className={styles.sectionSub}>Praticidade, economia e segurança para o seu dia a dia</p>
        </div>

        <div className={styles.motivosGrid}>
          {/* 1 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>1</div>
            <div className={styles.motivoContent}>
              <strong>Chega de carregar peso:</strong> Esqueça o esforço de empurrar carrinhos pesados e carregar sacolas cheias. A gente cuida de tudo!
            </div>
          </div>

          {/* 2 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>2</div>
            <div className={styles.motivoContent}>
              <strong>Conforto do seu lar:</strong> Receba suas compras com total comodidade e segurança na porta da sua casa.
            </div>
          </div>

          {/* 3 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>3</div>
            <div className={styles.motivoContent}>
              <strong>Economia de tempo:</strong> Pra quê perder 2h ou 3h fazendo compras? Isto não faz mais sentido em tempos onde o tempo está cada vez mais valioso!
            </div>
          </div>

          {/* 4 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>4</div>
            <div className={styles.motivoContent}>
              <strong>Economia de transporte:</strong> Economize gasolina ou despesas com transporte! Aquele stress no trânsito, ninguém merece...
            </div>
          </div>

          {/* 5 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>5</div>
            <div className={styles.motivoContent}>
              <strong>Zero filas:</strong> Gosta de pegar filas intermináveis nos caixas? Definitivamente, a gente também não.
            </div>
          </div>

          {/* 6 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>6</div>
            <div className={styles.motivoContent}>
              <strong>Mais segurança:</strong> Riscos no trânsito com acidentes, chuva e outros imprevistos aqui não acontecem.
            </div>
          </div>

          {/* 7 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>7</div>
            <div className={styles.motivoContent}>
              <strong>Entrega agendada:</strong> Faça o agendamento da entrega das suas compras para os horários mais convenientes da sua rotina.
            </div>
          </div>

          {/* 8 */}
          <div className={styles.motivoCard}>
            <div className={styles.motivoNumber}>8</div>
            <div className={styles.motivoContent}>
              <strong>Atendimento direto e fácil:</strong> Tem algo errado com a sua compra? Você fala diretamente com o seu mercado através do chat exclusivo. É muito fácil resolver e você ainda é muito bem atendido!
            </div>
          </div>

          {/* 10 - Destaque */}
          <div className={`${styles.motivoCard} ${styles.fullMotivoCard}`}>
            <div className={styles.motivoNumber}>9</div>
            <div className={styles.motivoContent}>
              <strong>Controle total das suas compras:</strong> Já reparou que a gente sempre gasta mais que o necessário quando vai aos supermercados? No Móbile Supermercados você tem a opção de controlar facilmente o volume de compras. E sabe o que é melhor? Esqueceu de algum item? É só comprar de novo! Sem problemas, sem dor de cabeça, sem stress e ainda economizando uma barbaridade!
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div className={styles.paymentCard}>
          <div className={styles.paymentIconWrap}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className={styles.paymentTitle}>Opções Flexíveis de Pagamento</div>
            <div className={styles.paymentDesc}>
              No Móbile Supermercados Digitais você tem opções de pagar diretamente no momento da entrega, com <strong>dinheiro</strong> ou <strong>cartão</strong>, além das formas online disponíveis por cada estabelecimento parceiro.
            </div>
          </div>
        </div>

        {/* Feedback / Contato */}
        <div className={styles.paymentCard}>
          <div className={styles.paymentIconWrap} style={{ background: '#fef3c7', color: '#b45309' }}>
            <Smile size={24} />
          </div>
          <div>
            <div className={styles.paymentTitle} style={{ color: '#92400e' }}>Baixe e fique de boa em casa com a família!</div>
            <div className={styles.paymentDesc}>
              Em outras palavras, baixe aí e depois nos conta o que achou! Se tiver alguma coisa que precise ser melhorada, é só nos enviar pelo e-mail:{" "}
              <a href="mailto:mobile@supermercadomobile.com.br" style={{ color: '#193281', fontWeight: 600, textDecoration: 'underline' }}>
                mobile@supermercadomobile.com.br
              </a>
            </div>
          </div>
        </div>

        {/* Seção Franquias */}
        <section className={styles.franchiseCard}>
          <div className={styles.franchiseBadge}>
            <Briefcase size={13} />
            <span>Oportunidade de Negócio</span>
          </div>
          <h2 className={styles.franchiseTitle}>Não tem Móbile Supermercados em sua cidade?</h2>
          <p className={styles.franchiseDesc}>
            Quem sabe você seja o empreendedor que estamos buscando para levar uma franquia nossa aí para a sua cidade? Vamos conversar sem compromisso para você conhecer este negócio incrível?
          </p>
          <a href="mailto:franquias@supermercadomobile.com.br" className={styles.franchiseBtn}>
            <Mail size={18} />
            <span>Falar com o time de Franquias</span>
          </a>
        </section>

        <footer className={styles.footerNote}>
          © {new Date().getFullYear()} Móbile Supermercados Online. Todos os direitos reservados.
        </footer>
      </main>
    </div>
  );
}
