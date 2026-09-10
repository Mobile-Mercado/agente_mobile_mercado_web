import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Calendar, 
  Lock, 
  Mail, 
  ExternalLink,
  Info,
  MapPin,
  User,
  Activity,
  MessageSquare
} from 'lucide-react';
import styles from './declaracao.module.css';

export const metadata: Metadata = {
  title: 'Declaração de Privacidade — Móbile Supermercados Digitais',
  description: 'Declaração de Privacidade e Proteção de Dados da Plataforma Móbile Supermercados Digitais.',
};

export default function DeclaracaoDePrivacidadePage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Barra de Navegação Superior */}
      <header className={styles.topBar}>
        <div className={styles.brandWrap}>
          <div className={styles.brandLogo}>M</div>
          <div>
            <div className={styles.brandTitle}>Móbile Supermercados Digitais</div>
            <div className={styles.brandSub}>Privacidade &amp; Proteção de Dados</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Voltar à Loja</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className={styles.contentContainer}>
        {/* Hero Card */}
        <div className={styles.heroCard}>
          <div className={styles.badge}>
            <ShieldCheck size={14} />
            <span>LGPD &amp; Proteção de Dados</span>
          </div>
          <h1 className={styles.mainTitle}>Declaração de Privacidade</h1>
          <div className={styles.updateDate}>
            <Calendar size={15} />
            <span>Atualizado: 07 de Abril de 2021</span>
          </div>

          <div className={styles.introHighlight}>
            <strong>Compromisso de Segurança:</strong> Os seus dados são coletados principalmente para garantir que seja você a pessoa que realmente esteja fazendo os pedidos e não outra em seu lugar.
          </div>

          <p className={styles.introText}>
            Respeitamos a sua privacidade e recomendamos que conheça todas as nossas práticas para entender como a proteção dos seus dados é importante para o Móbile Supermercados Digitais.
          </p>
          <p className={styles.introText}>
            Sobre a utilização dos seus dados, faz parte da nossa missão entender, compreender e desenvolver um serviço que proporciona uma experiência cada vez melhor e mais agradável. Aqui a gente descreve como obtemos os dados e armazenamos para utilizar e compartilhar as suas informações.
          </p>
        </div>

        {/* Índice Rápido */}
        <nav className={styles.indexCard} aria-label="Índice de seções">
          <div className={styles.indexTitle}>Tópicos da Declaração</div>
          <div className={styles.indexGrid}>
            <a href="#secao-1" className={styles.indexLink}>1. A quem se aplica</a>
            <a href="#secao-2" className={styles.indexLink}>2. Dados coletados e uso</a>
            <a href="#secao-3" className={styles.indexLink}>3. Melhoria dos serviços</a>
            <a href="#secao-4" className={styles.indexLink}>4. Avisos e Notificações</a>
            <a href="#secao-5" className={styles.indexLink}>5. Marketing e promoções</a>
            <a href="#secao-6" className={styles.indexLink}>6. Suporte e segurança</a>
            <a href="#secao-7" className={styles.indexLink}>7. Cookies e tecnologias</a>
            <a href="#secao-8" className={styles.indexLink}>8. Armazenamento de dados</a>
            <a href="#secao-9" className={styles.indexLink}>9. Compartilhamento parceiros</a>
            <a href="#secao-10" className={styles.indexLink}>10. Autoridades</a>
            <a href="#secao-11" className={styles.indexLink}>11. Proteção e mudanças</a>
            <a href="#secao-12" className={styles.indexLink}>12. Como exercer seus direitos</a>
          </div>
        </nav>

        {/* Seção 1 */}
        <article id="secao-1" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>1</div>
            <h2 className={styles.sectionTitle}>A quem essa Declaração de Privacidade se aplica?</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Esta Declaração é aplicável a todos que acessarem, se cadastrarem e utilizarem os serviços da <strong>Plataforma Móbile Supermercados Digitais</strong>.
            </p>
            <p>
              Sempre que mencionamos a palavra <strong>“Plataforma”</strong> estamos nos referindo ao nosso aplicativo e site que oferecem juntos todos os nossos serviços.
            </p>
            <p>
              Sempre que mencionamos os termos <strong>“você”</strong>, <strong>“seu”</strong> ou <strong>“sua”</strong>, estamos nos referindo diretamente a Você que se cadastrou ou se cadastrará como usuário da nossa Plataforma.
            </p>
          </div>
        </article>

        {/* Seção 2 */}
        <article id="secao-2" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>2</div>
            <h2 className={styles.sectionTitle}>Quais dados coletamos e como são utilizados?</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Quando você acessa, se cadastra e cria uma conta para utilizar a Plataforma Móbile Supermercados Digitais, poderemos obter várias informações sobre você, como:
            </p>

            <div className={styles.subItem}>
              <div className={styles.subItemTitle}>• Dados de perfil</div>
              <div className={styles.subItemDesc}>
                Nome, CPF (opcional ou obrigatório quando utilizado por estabelecimentos para fins fiscais), e-mail, endereço de entrega, telefone e outros tipos de contato. Caso você se cadastre utilizando sua conta do Facebook, estará permitindo que o Móbile Supermercados Digitais acesse as informações pessoais, que são as mesmas disponíveis de acordo com as suas configurações de privacidade no Facebook.
              </div>
            </div>

            <div className={styles.subItem}>
              <div className={styles.subItemTitle}>• Dados de localização para a entrega do pedido</div>
              <div className={styles.subItemDesc}>
                É necessário que você nos forneça o endereço de entrega do pedido manualmente, mas também podemos coletar dados através da sua localização automaticamente via GPS/WIFI do seu dispositivo que estiver utilizando para acessar o Móbile Supermercados Digitais para obter dados como: IP, tipo de navegador, versão do sistema operacional, provedor de Internet (ISP), páginas de busca, data, horário, sequência de cliques, marca do dispositivo, operadora, versão do aparelho e do aplicativo e informações de acessibilidade do aparelho e redes de internet. A localização fornecida fará parte do seu cadastro.
              </div>
            </div>

            <div className={styles.subItem}>
              <div className={styles.subItemTitle}>• Dados gerados durante o uso da Plataforma</div>
              <div className={styles.subItemDesc}>
                Número de interações na Plataforma, datas, horários, acessos, detalhes dos pedidos já realizados, valores, distância entre você e o estabelecimento e o local de entrega escolhido e as formas de pagamento.
              </div>
            </div>

            <div className={styles.subItem}>
              <div className={styles.subItemTitle}>• Dados de intermediação de comunicação entre usuários e estabelecimentos</div>
              <div className={styles.subItemDesc}>
                Conteúdo das mensagens enviadas e recebidas via chat da Plataforma, incluindo textos, data e hora.
              </div>
            </div>
          </div>
        </article>

        {/* Seção 3 */}
        <article id="secao-3" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>3</div>
            <h2 className={styles.sectionTitle}>Como utilizamos os seus dados para melhorar os nossos serviços e produtos?</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Além de serem utilizados para aprimorar, melhorar e personalizar sua conta e serviços para você, seus dados são utilizados para operações internas na entrega dos pedidos pelos estabelecimentos onde você comprou.
            </p>
            <p>
              Com o objetivo de melhorar os serviços, seus dados pessoais também são utilizados para análise de informações e análises estatísticas de uso.
            </p>
            <p>
              Sempre que envia feedback e avalia a nossa Plataforma através das estrelinhas e comentários, ou sobre os serviços dos estabelecimentos, nós podemos utilizar estas avaliações de feedback incluindo os comentários para publicar, analisar, processar e tratar essa interação identificando você através do seu cadastro.
            </p>
          </div>
        </article>

        {/* Seção 4 */}
        <article id="secao-4" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>4</div>
            <h2 className={styles.sectionTitle}>Avisos e Notificações</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Enviamos avisos e notificações sobre compras, mudanças e melhorias, condições e políticas. Você poderá gerenciar as opções disponíveis de comunicação direto pelo aplicativo, desde já concordando e nos autorizando a utilização.
            </p>
          </div>
        </article>

        {/* Seção 5 */}
        <article id="secao-5" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>5</div>
            <h2 className={styles.sectionTitle}>Marketing e promoções</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Você nos autoriza o envio de publicidade, materiais promocionais, novidades, e direcionamento de marketing em redes sociais, notificações push e a compartilhar as informações necessárias para os parceiros e estabelecimentos que operam no Móbile Supermercados Digitais, que possuem política de privacidade e de proteção equivalente ao descrito nesta declaração.
            </p>
            <p>
              Utilizamos seus dados também para entrar em contato diretamente para fazer pesquisas importantes para nos ajudar a criar melhorias, mas você poderá recusar sua participação quando questionado.
            </p>
          </div>
        </article>

        {/* Seção 6 */}
        <article id="secao-6" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>6</div>
            <h2 className={styles.sectionTitle}>Suporte, atendimento e segurança</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Sempre que você precisar de “ajuda” e solicitar atendimento e suporte sobre qualquer problema na Plataforma, podemos utilizar seus dados para: evitar fraudes e verificar se é você que acessou ou solicitou o atendimento; encaminhar suas dúvidas e problemas para o nosso setor responsável por monitorar e melhorar nossos serviços.
            </p>
          </div>
        </article>

        {/* Seção 7 */}
        <article id="secao-7" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>7</div>
            <h2 className={styles.sectionTitle}>Como utilizamos cookies e tecnologias similares</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Tanto a Móbile Supermercados Digitais quanto seus parceiros e estabelecimentos contam com a utilização de tecnologias como cookies (pequenos arquivos armazenados diretamente no seu dispositivo ou navegador), pixel tags (pequenos códigos utilizados para “ler”, armazenar e transmitir informações de IP e horários) ou tecnologias semelhantes que nos ajudam, de formas diferentes, a autenticar contas e na personalização da sua experiência em todos os sentidos quando utiliza a nossa Plataforma.
            </p>
            <p>
              Por exemplo, quando a Plataforma personaliza uma mensagem de boas-vindas com o seu nome. O uso destas tecnologias também faz com que todos os nossos conteúdos publicitários sejam mais relevantes de acordo com os seus interesses, além de usar essas informações para classificar e identificar os usuários de acordo com o uso da Plataforma.
            </p>
            <p>
              Estas tecnologias nos ajudam a analisar tendências, aprender sobre o comportamento dos usuários e também com informações demográficas de maneira geral em nossa base de dados. Podemos permitir que terceiros contratados pelo Móbile Supermercados Digitais como: <a href="https://www.facebook.com/about/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: "#193281", fontWeight: 600, textDecoration: "underline" }}>Facebook</a> e <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR" target="_blank" rel="noopener noreferrer" style={{ color: "#193281", fontWeight: 600, textDecoration: "underline" }}>Google Analytics</a> utilizem também estas tecnologias por meio de compartilhamento de dados conosco.
            </p>
          </div>
        </article>

        {/* Seção 8 */}
        <article id="secao-8" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>8</div>
            <h2 className={styles.sectionTitle}>Como, onde e por quanto tempo os dados são armazenados</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Os dados são armazenados em serviços de nuvem confiáveis que empregam alto nível de segurança, contratados dentro ou fora do Brasil.
            </p>
            <p>
              O Móbile Supermercados Digitais armazena as suas informações até que você solicite a exclusão de sua conta. Em algumas hipóteses de guarda obrigatória de registros previstas em leis aplicáveis, podemos manter os seus dados armazenados.
            </p>
          </div>
        </article>

        {/* Seção 9 */}
        <article id="secao-9" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>9</div>
            <h2 className={styles.sectionTitle}>Como os dados são compartilhados entre estabelecimentos e parceiros</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Por razões diversas e de necessidades, os dados podem ou não serem compartilhados pelo Móbile Supermercados Digitais para parceiros, estabelecimentos e prestadores de serviços terceirizados que por sua vez terão o mesmo dever contratual de proteção dos termos de Privacidade do Móbile Supermercados Digitais para garantir o cumprimento dos nossos padrões de confidencialidade e segurança.
            </p>
            <p>
              No caso de alterações societárias do Móbile Supermercados Digitais, seus dados serão transferidos, respeitando esta Declaração.
            </p>
          </div>
        </article>

        {/* Seção 10 */}
        <article id="secao-10" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>10</div>
            <h2 className={styles.sectionTitle}>Autoridades</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Se necessário for, poderemos compartilhar suas informações com autoridades policiais ou judiciais, ou outros, decisão judicial, por cooperação de acordo com a lei, ou responder a processos judiciais ou disputas de qualquer tipo, inclusive quando considerarmos que há motivos suficientes de atividades suspeitas ou ilegal de um usuário, a fim de manter a integridade e a segurança independentemente de existir ou não requisição das autoridades.
            </p>
          </div>
        </article>

        {/* Seção 11 */}
        <article id="secao-11" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>11</div>
            <h2 className={styles.sectionTitle}>Como seus dados são protegidos? Pode haver mudanças nesta Declaração?</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Várias são as medidas administrativas de segurança, como para proteção de dados pessoais contra acessos não autorizados implementando também técnicas de criptografia, monitoramento e testes de segurança, protegendo seus dados como um todo.
            </p>
            <p>
              O Móbile Supermercados Digitais busca de tempos em tempos atualizar e melhorar cada vez mais essa Declaração de Privacidade. Sempre deixamos um aviso em nossa Plataforma na área de Configurações &gt; Declaração de Privacidade quando uma nova versão entrar em vigor.
            </p>
          </div>
        </article>

        {/* Seção 12 */}
        <article id="secao-12" className={styles.highlightContact}>
          <h2 className={styles.highlightContactTitle}>12. Como exercer seus direitos?</h2>
          <p className={styles.highlightContactDesc}>
            Enquanto titular de dados pessoais, se você tiver alguma dúvida com relação a esta Declaração de Privacidade ou qualquer uma das práticas aqui descritas, entre em contato conosco através do nosso e-mail exclusivo:
          </p>
          <div>
            <a href="mailto:privacidade@supermercadomobile.com.br" className={styles.emailPill}>
              <Mail size={18} />
              <span>privacidade@supermercadomobile.com.br</span>
            </a>
          </div>
        </article>

        <footer className={styles.footerNote}>
          © {new Date().getFullYear()} Móbile Supermercados Digitais. Todos os direitos reservados.
        </footer>
      </main>
    </div>
  );
}
