/**
 * Lume — Configuração centralizada da loja (White-Label).
 *
 * PARA CONFIGURAR UMA NOVA LOJA CLIENTE:
 * 1. Altere o nome, WhatsApp, dados e as CORES (primaryColor, secondaryColor) abaixo.
 * 2. Substitua o logotipo em 'public/images/logo.png'.
 * E pronto! Toda a vitrine, rodapé, sacola, botões, SEO e links de WhatsApp serão atualizados.
 */

const STORE_NAME = 'Oliveira';

export const STORE_CONFIG = {
  /** Cor primária da marca: Dourado Refinado do Logo (#CCA45E) */
  primaryColor: '#CCA45E',

  /** Cor secundária/auxiliar da marca: Azul Suave / Branco (#CBD5E1) */
  secondaryColor: '#CBD5E1',

  /** Fundo premium Azul Marinho (#0A152E) */
  backgroundColor: '#0A152E',

  /** Nome da loja exibido no site e no painel */
  name: STORE_NAME,

  /** Subtítulo / Tagline da marca no header */
  tagline: 'MODA ESPORTIVA E CASUAL',

  /** Slogan / Descrição resumida da loja para SEO e rodapé */
  description: 'Moda esportiva e casual masculina e feminina. Roupas desenvolvidas para treinos intensos na academia e passeios casuais com máximo estilo, conforto e performance.',

  /** Caminho do logotipo/monograma principal (fundo transparente) */
  logoUrl: '/images/oliveira-icon.png',

  /** Logotipo completo com tipografia e monograma (fundo transparente) */
  fullLogoUrl: '/images/oliveira-logo.png',

  /** Logotipo original com fundo azul marinho */
  originalLogoUrl: '/images/oliveira-logo.jpg',

  /** Número do WhatsApp do vendedor (com código do país e DDD, sem + ou espaços) */
  whatsappNumber: '5511963041542',

  /** Número do WhatsApp formatado para exibição visual */
  whatsappFormatted: '+55 11 96304-1542',

  /** E-mail oficial de contato */
  email: 'contato@oliveiramoda.com.br',

  /** Horário de atendimento exibido no rodapé */
  businessHours: 'Segunda a Sábado — 09:00 às 12:00 e 14:00 às 19:00',

  /** Título e texto do manifesto / conceito na Home */
  aboutEyebrow: 'A MARCA',
  aboutTitle: 'Performance no treino. Estilo nos passeios.',
  aboutText: 'A Oliveira cria peças esportivas e casuais masculinas e femininas com tecidos inteligentes, respirabilidade e caimento impecável. Do treino pesado na academia aos momentos casuais de lazer, viva o seu melhor estilo com máxima atitude.',

  /** Moeda utilizada */
  currency: 'BRL',

  /** Locale para formatação */
  locale: 'pt-BR',

  /** Mensagem de saudação padrão do WhatsApp */
  whatsappGreeting: `Olá! Gostaria de fazer um pedido na ${STORE_NAME}.`,

  /** Mensagem de encerramento do WhatsApp */
  whatsappClosing: 'Gostaria de finalizar meu pedido.',
} as const;
