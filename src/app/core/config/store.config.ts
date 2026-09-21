/**
 * Lume — Configuração centralizada da loja (White-Label).
 *
 * PARA CONFIGURAR UMA NOVA LOJA CLIENTE:
 * 1. Altere o nome, WhatsApp, dados e as CORES (primaryColor, secondaryColor) abaixo.
 * 2. Substitua o logotipo em 'public/images/logo.png'.
 * E pronto! Toda a vitrine, rodapé, sacola, botões, SEO e links de WhatsApp serão atualizados.
 */

const STORE_NAME = 'Lume';

export const STORE_CONFIG = {
  /** Cor primária da marca (hexadecimal). Ex: '#ffffff' (branco), '#ff5500' (laranja), '#e11d48' (vermelho), etc. */
  primaryColor: '#ffffff',

  /** Cor secundária/auxiliar da marca (hexadecimal). Ex: '#a1a1aa' (cinza metálico), '#f97316', etc. */
  secondaryColor: '#a1a1aa',

  /** Nome da loja exibido no site e no painel */
  name: STORE_NAME,

  /** Subtítulo / Tagline da marca no header (ex: 'IMPORTS', 'STORE', 'CLOTHING', ou '' se não quiser) */
  tagline: 'IMPORTS',

  /** Slogan / Descrição resumida da loja para SEO e rodapé */
  description: 'Streetwear autêntico, modelagens oversized e tecidos heavyweight desenvolvidos para a nova geração. Estilo que dita o ritmo das ruas.',

  /** Caminho do logotipo principal */
  logoUrl: '/images/logo.png',

  /** Número do WhatsApp do vendedor (com código do país e DDD, sem + ou espaços) */
  whatsappNumber: '5511963041542',

  /** Número do WhatsApp formatado para exibição visual */
  whatsappFormatted: '+55 11 96304-1542',

  /** E-mail oficial de contato */
  email: 'contato@lume.com.br',

  /** Horário de atendimento exibido no rodapé */
  businessHours: 'Segunda a Sábado — 09h às 20h',

  /** Título e texto do manifesto / conceito na Home */
  aboutEyebrow: 'O CONCEITO',
  aboutTitle: 'Nascida nas ruas. Feita para se destacar.',
  aboutText: 'Criamos peças com cortes boxy marcantes, tecidos pesados de alta durabilidade e caimento impecável para jovens que ditam suas próprias regras, sem concessões.',

  /** Moeda utilizada */
  currency: 'BRL',

  /** Locale para formatação */
  locale: 'pt-BR',

  /** Mensagem de saudação padrão do WhatsApp */
  whatsappGreeting: `Olá! Gostaria de fazer um pedido na ${STORE_NAME}.`,

  /** Mensagem de encerramento do WhatsApp */
  whatsappClosing: 'Gostaria de finalizar meu pedido.',
} as const;
