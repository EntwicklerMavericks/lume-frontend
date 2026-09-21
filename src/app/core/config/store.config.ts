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
  /** Cor primária da marca: Dourado Ouro Nobre (#D4AF37) */
  primaryColor: '#D4AF37',

  /** Cor secundária/auxiliar da marca: Azul Suave / Branco (#CBD5E1) */
  secondaryColor: '#CBD5E1',

  /** Fundo premium Azul Marinho Meia-Noite (#080E1A) */
  backgroundColor: '#080E1A',

  /** Nome da loja exibido no site e no painel */
  name: STORE_NAME,

  /** Subtítulo / Tagline da marca no header */
  tagline: 'MODA ESPORTIVA E CASUAL',

  /** Slogan / Descrição resumida da loja para SEO e rodapé */
  description: 'Aqui tem esporte, estilo e você! Moda esportiva e casual com modelagens autênticas, cortes modernos e tecidos de alta durabilidade.',

  /** Caminho do logotipo principal */
  logoUrl: '/images/oliveira-logo.png',

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
  aboutTitle: 'Esporte, Estilo e Atitude. Feita para você.',
  aboutText: 'A Oliveira une o melhor da moda esportiva e casual, trazendo peças com caimento impecável, conforto superior e presença marcante para o seu dia a dia e treinos.',

  /** Moeda utilizada */
  currency: 'BRL',

  /** Locale para formatação */
  locale: 'pt-BR',

  /** Mensagem de saudação padrão do WhatsApp */
  whatsappGreeting: `Olá! Gostaria de fazer um pedido na ${STORE_NAME}.`,

  /** Mensagem de encerramento do WhatsApp */
  whatsappClosing: 'Gostaria de finalizar meu pedido.',
} as const;
