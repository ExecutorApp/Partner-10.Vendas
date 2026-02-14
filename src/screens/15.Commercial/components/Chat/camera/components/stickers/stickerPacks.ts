// ========================================
// Dados dos Packs de Figurinhas
// Stickers modernos estilo Kawaii/Cartoon
// ========================================

// ========================================
// Tipos
// ========================================
export interface LottieSticker {
  id: string;                                    //......ID unico do sticker
  type: 'image';                                 //......Tipo do sticker
  preview: string;                               //......URL da imagem preview
  imageUrl: string;                              //......URL da imagem full
  name: string;                                  //......Nome do sticker
}

export interface StickerPack {
  id: string;                                    //......ID unico do pack
  name: string;                                  //......Nome do pack
  icon: string;                                  //......URL do icone do pack
  stickers: LottieSticker[];                     //......Lista de stickers
}

// ========================================
// CDN Base URLs
// ========================================
const FLATICON = 'https://cdn-icons-png.flaticon.com';

// ========================================
// Pack: Monstrinhos Kawaii
// ========================================
const PACK_MONSTRINHOS: StickerPack = {
  id: 'monstrinhos',
  name: 'Monstrinhos',
  icon: `${FLATICON}/128/4436/4436481.png`,
  stickers: [
    { id: 'mo1', type: 'image', preview: `${FLATICON}/128/4436/4436481.png`, imageUrl: `${FLATICON}/256/4436/4436481.png`, name: 'Monstrinho Azul' },
    { id: 'mo2', type: 'image', preview: `${FLATICON}/128/4436/4436495.png`, imageUrl: `${FLATICON}/256/4436/4436495.png`, name: 'Monstrinho Rosa' },
    { id: 'mo3', type: 'image', preview: `${FLATICON}/128/4436/4436529.png`, imageUrl: `${FLATICON}/256/4436/4436529.png`, name: 'Monstrinho Verde' },
    { id: 'mo4', type: 'image', preview: `${FLATICON}/128/4436/4436553.png`, imageUrl: `${FLATICON}/256/4436/4436553.png`, name: 'Monstrinho Roxo' },
    { id: 'mo5', type: 'image', preview: `${FLATICON}/128/4436/4436567.png`, imageUrl: `${FLATICON}/256/4436/4436567.png`, name: 'Monstrinho Laranja' },
    { id: 'mo6', type: 'image', preview: `${FLATICON}/128/4436/4436581.png`, imageUrl: `${FLATICON}/256/4436/4436581.png`, name: 'Monstrinho Amarelo' },
    { id: 'mo7', type: 'image', preview: `${FLATICON}/128/4436/4436456.png`, imageUrl: `${FLATICON}/256/4436/4436456.png`, name: 'Monstrinho Vermelho' },
    { id: 'mo8', type: 'image', preview: `${FLATICON}/128/4436/4436469.png`, imageUrl: `${FLATICON}/256/4436/4436469.png`, name: 'Monstrinho Ciano' },
  ],
};

// ========================================
// Pack: Gatinhos Kawaii
// ========================================
const PACK_GATINHOS: StickerPack = {
  id: 'gatinhos',
  name: 'Gatinhos',
  icon: `${FLATICON}/128/6632/6632597.png`,
  stickers: [
    { id: 'ga1', type: 'image', preview: `${FLATICON}/128/6632/6632597.png`, imageUrl: `${FLATICON}/256/6632/6632597.png`, name: 'Gatinho Feliz' },
    { id: 'ga2', type: 'image', preview: `${FLATICON}/128/6632/6632612.png`, imageUrl: `${FLATICON}/256/6632/6632612.png`, name: 'Gatinho Fofo' },
    { id: 'ga3', type: 'image', preview: `${FLATICON}/128/6632/6632626.png`, imageUrl: `${FLATICON}/256/6632/6632626.png`, name: 'Gatinho Dormindo' },
    { id: 'ga4', type: 'image', preview: `${FLATICON}/128/6632/6632640.png`, imageUrl: `${FLATICON}/256/6632/6632640.png`, name: 'Gatinho Bravo' },
    { id: 'ga5', type: 'image', preview: `${FLATICON}/128/6632/6632654.png`, imageUrl: `${FLATICON}/256/6632/6632654.png`, name: 'Gatinho Amor' },
    { id: 'ga6', type: 'image', preview: `${FLATICON}/128/6632/6632668.png`, imageUrl: `${FLATICON}/256/6632/6632668.png`, name: 'Gatinho Chorando' },
    { id: 'ga7', type: 'image', preview: `${FLATICON}/128/6632/6632580.png`, imageUrl: `${FLATICON}/256/6632/6632580.png`, name: 'Gatinho Surpreso' },
    { id: 'ga8', type: 'image', preview: `${FLATICON}/128/6632/6632564.png`, imageUrl: `${FLATICON}/256/6632/6632564.png`, name: 'Gatinho Legal' },
  ],
};

// ========================================
// Pack: Ursinhos Fofos
// ========================================
const PACK_URSINHOS: StickerPack = {
  id: 'ursinhos',
  name: 'Ursinhos',
  icon: `${FLATICON}/128/8926/8926096.png`,
  stickers: [
    { id: 'ur1', type: 'image', preview: `${FLATICON}/128/8926/8926096.png`, imageUrl: `${FLATICON}/256/8926/8926096.png`, name: 'Ursinho Feliz' },
    { id: 'ur2', type: 'image', preview: `${FLATICON}/128/8926/8926111.png`, imageUrl: `${FLATICON}/256/8926/8926111.png`, name: 'Ursinho Amor' },
    { id: 'ur3', type: 'image', preview: `${FLATICON}/128/8926/8926125.png`, imageUrl: `${FLATICON}/256/8926/8926125.png`, name: 'Ursinho Dormindo' },
    { id: 'ur4', type: 'image', preview: `${FLATICON}/128/8926/8926139.png`, imageUrl: `${FLATICON}/256/8926/8926139.png`, name: 'Ursinho Triste' },
    { id: 'ur5', type: 'image', preview: `${FLATICON}/128/8926/8926153.png`, imageUrl: `${FLATICON}/256/8926/8926153.png`, name: 'Ursinho Bravo' },
    { id: 'ur6', type: 'image', preview: `${FLATICON}/128/8926/8926167.png`, imageUrl: `${FLATICON}/256/8926/8926167.png`, name: 'Ursinho Surpreso' },
    { id: 'ur7', type: 'image', preview: `${FLATICON}/128/8926/8926082.png`, imageUrl: `${FLATICON}/256/8926/8926082.png`, name: 'Ursinho Legal' },
    { id: 'ur8', type: 'image', preview: `${FLATICON}/128/8926/8926068.png`, imageUrl: `${FLATICON}/256/8926/8926068.png`, name: 'Ursinho Pensando' },
  ],
};

// ========================================
// Pack: Coelhinhos Kawaii
// ========================================
const PACK_COELHINHOS: StickerPack = {
  id: 'coelhinhos',
  name: 'Coelhinhos',
  icon: `${FLATICON}/128/7154/7154192.png`,
  stickers: [
    { id: 'co1', type: 'image', preview: `${FLATICON}/128/7154/7154192.png`, imageUrl: `${FLATICON}/256/7154/7154192.png`, name: 'Coelhinho Feliz' },
    { id: 'co2', type: 'image', preview: `${FLATICON}/128/7154/7154206.png`, imageUrl: `${FLATICON}/256/7154/7154206.png`, name: 'Coelhinho Amor' },
    { id: 'co3', type: 'image', preview: `${FLATICON}/128/7154/7154220.png`, imageUrl: `${FLATICON}/256/7154/7154220.png`, name: 'Coelhinho Dormindo' },
    { id: 'co4', type: 'image', preview: `${FLATICON}/128/7154/7154234.png`, imageUrl: `${FLATICON}/256/7154/7154234.png`, name: 'Coelhinho Triste' },
    { id: 'co5', type: 'image', preview: `${FLATICON}/128/7154/7154248.png`, imageUrl: `${FLATICON}/256/7154/7154248.png`, name: 'Coelhinho Bravo' },
    { id: 'co6', type: 'image', preview: `${FLATICON}/128/7154/7154262.png`, imageUrl: `${FLATICON}/256/7154/7154262.png`, name: 'Coelhinho Surpreso' },
    { id: 'co7', type: 'image', preview: `${FLATICON}/128/7154/7154178.png`, imageUrl: `${FLATICON}/256/7154/7154178.png`, name: 'Coelhinho Legal' },
    { id: 'co8', type: 'image', preview: `${FLATICON}/128/7154/7154164.png`, imageUrl: `${FLATICON}/256/7154/7154164.png`, name: 'Coelhinho Pensando' },
  ],
};

// ========================================
// Pack: Cachorrinhos Fofos
// ========================================
const PACK_CACHORRINHOS: StickerPack = {
  id: 'cachorrinhos',
  name: 'Cachorrinhos',
  icon: `${FLATICON}/128/8403/8403689.png`,
  stickers: [
    { id: 'ca1', type: 'image', preview: `${FLATICON}/128/8403/8403689.png`, imageUrl: `${FLATICON}/256/8403/8403689.png`, name: 'Cachorrinho Feliz' },
    { id: 'ca2', type: 'image', preview: `${FLATICON}/128/8403/8403703.png`, imageUrl: `${FLATICON}/256/8403/8403703.png`, name: 'Cachorrinho Amor' },
    { id: 'ca3', type: 'image', preview: `${FLATICON}/128/8403/8403717.png`, imageUrl: `${FLATICON}/256/8403/8403717.png`, name: 'Cachorrinho Dormindo' },
    { id: 'ca4', type: 'image', preview: `${FLATICON}/128/8403/8403731.png`, imageUrl: `${FLATICON}/256/8403/8403731.png`, name: 'Cachorrinho Triste' },
    { id: 'ca5', type: 'image', preview: `${FLATICON}/128/8403/8403745.png`, imageUrl: `${FLATICON}/256/8403/8403745.png`, name: 'Cachorrinho Bravo' },
    { id: 'ca6', type: 'image', preview: `${FLATICON}/128/8403/8403759.png`, imageUrl: `${FLATICON}/256/8403/8403759.png`, name: 'Cachorrinho Surpreso' },
    { id: 'ca7', type: 'image', preview: `${FLATICON}/128/8403/8403675.png`, imageUrl: `${FLATICON}/256/8403/8403675.png`, name: 'Cachorrinho Legal' },
    { id: 'ca8', type: 'image', preview: `${FLATICON}/128/8403/8403661.png`, imageUrl: `${FLATICON}/256/8403/8403661.png`, name: 'Cachorrinho Pensando' },
  ],
};

// ========================================
// Pack: Fantasminhas
// ========================================
const PACK_FANTASMAS: StickerPack = {
  id: 'fantasmas',
  name: 'Fantasminhas',
  icon: `${FLATICON}/128/9273/9273651.png`,
  stickers: [
    { id: 'fa1', type: 'image', preview: `${FLATICON}/128/9273/9273651.png`, imageUrl: `${FLATICON}/256/9273/9273651.png`, name: 'Fantasma Feliz' },
    { id: 'fa2', type: 'image', preview: `${FLATICON}/128/9273/9273665.png`, imageUrl: `${FLATICON}/256/9273/9273665.png`, name: 'Fantasma Amor' },
    { id: 'fa3', type: 'image', preview: `${FLATICON}/128/9273/9273679.png`, imageUrl: `${FLATICON}/256/9273/9273679.png`, name: 'Fantasma Dormindo' },
    { id: 'fa4', type: 'image', preview: `${FLATICON}/128/9273/9273693.png`, imageUrl: `${FLATICON}/256/9273/9273693.png`, name: 'Fantasma Triste' },
    { id: 'fa5', type: 'image', preview: `${FLATICON}/128/9273/9273707.png`, imageUrl: `${FLATICON}/256/9273/9273707.png`, name: 'Fantasma Assustado' },
    { id: 'fa6', type: 'image', preview: `${FLATICON}/128/9273/9273721.png`, imageUrl: `${FLATICON}/256/9273/9273721.png`, name: 'Fantasma Surpreso' },
    { id: 'fa7', type: 'image', preview: `${FLATICON}/128/9273/9273637.png`, imageUrl: `${FLATICON}/256/9273/9273637.png`, name: 'Fantasma Legal' },
    { id: 'fa8', type: 'image', preview: `${FLATICON}/128/9273/9273623.png`, imageUrl: `${FLATICON}/256/9273/9273623.png`, name: 'Fantasma Pensando' },
  ],
};

// ========================================
// Pack: Alienzinhos
// ========================================
const PACK_ALIENS: StickerPack = {
  id: 'aliens',
  name: 'Alienzinhos',
  icon: `${FLATICON}/128/3271/3271917.png`,
  stickers: [
    { id: 'al1', type: 'image', preview: `${FLATICON}/128/3271/3271917.png`, imageUrl: `${FLATICON}/256/3271/3271917.png`, name: 'Alien Feliz' },
    { id: 'al2', type: 'image', preview: `${FLATICON}/128/3271/3271933.png`, imageUrl: `${FLATICON}/256/3271/3271933.png`, name: 'Alien Amor' },
    { id: 'al3', type: 'image', preview: `${FLATICON}/128/3271/3271949.png`, imageUrl: `${FLATICON}/256/3271/3271949.png`, name: 'Alien Dormindo' },
    { id: 'al4', type: 'image', preview: `${FLATICON}/128/3271/3271965.png`, imageUrl: `${FLATICON}/256/3271/3271965.png`, name: 'Alien Triste' },
    { id: 'al5', type: 'image', preview: `${FLATICON}/128/3271/3271981.png`, imageUrl: `${FLATICON}/256/3271/3271981.png`, name: 'Alien Bravo' },
    { id: 'al6', type: 'image', preview: `${FLATICON}/128/3271/3271997.png`, imageUrl: `${FLATICON}/256/3271/3271997.png`, name: 'Alien Surpreso' },
    { id: 'al7', type: 'image', preview: `${FLATICON}/128/3271/3271901.png`, imageUrl: `${FLATICON}/256/3271/3271901.png`, name: 'Alien Legal' },
    { id: 'al8', type: 'image', preview: `${FLATICON}/128/3271/3271885.png`, imageUrl: `${FLATICON}/256/3271/3271885.png`, name: 'Alien Pensando' },
  ],
};

// ========================================
// Pack: Emocoes Kawaii
// ========================================
const PACK_EMOCOES: StickerPack = {
  id: 'emocoes',
  name: 'Emocoes',
  icon: `${FLATICON}/128/3688/3688162.png`,
  stickers: [
    { id: 'em1', type: 'image', preview: `${FLATICON}/128/3688/3688162.png`, imageUrl: `${FLATICON}/256/3688/3688162.png`, name: 'Muito Feliz' },
    { id: 'em2', type: 'image', preview: `${FLATICON}/128/3688/3688269.png`, imageUrl: `${FLATICON}/256/3688/3688269.png`, name: 'Apaixonado' },
    { id: 'em3', type: 'image', preview: `${FLATICON}/128/3688/3688289.png`, imageUrl: `${FLATICON}/256/3688/3688289.png`, name: 'Rindo' },
    { id: 'em4', type: 'image', preview: `${FLATICON}/128/3688/3688186.png`, imageUrl: `${FLATICON}/256/3688/3688186.png`, name: 'Triste' },
    { id: 'em5', type: 'image', preview: `${FLATICON}/128/3688/3688211.png`, imageUrl: `${FLATICON}/256/3688/3688211.png`, name: 'Chorando' },
    { id: 'em6', type: 'image', preview: `${FLATICON}/128/3688/3688236.png`, imageUrl: `${FLATICON}/256/3688/3688236.png`, name: 'Surpreso' },
    { id: 'em7', type: 'image', preview: `${FLATICON}/128/3688/3688260.png`, imageUrl: `${FLATICON}/256/3688/3688260.png`, name: 'Bravo' },
    { id: 'em8', type: 'image', preview: `${FLATICON}/128/3688/3688174.png`, imageUrl: `${FLATICON}/256/3688/3688174.png`, name: 'Legal' },
  ],
};

// ========================================
// Lista de Todos os Packs
// ========================================
export const STICKER_PACKS: StickerPack[] = [
  PACK_MONSTRINHOS,
  PACK_GATINHOS,
  PACK_URSINHOS,
  PACK_COELHINHOS,
  PACK_CACHORRINHOS,
  PACK_FANTASMAS,
  PACK_ALIENS,
  PACK_EMOCOES,
];

// ========================================
// Funcao para Buscar Sticker por ID
// ========================================
export const findStickerById = (stickerId: string): LottieSticker | null => {
  for (const pack of STICKER_PACKS) {
    const sticker = pack.stickers.find((s) => s.id === stickerId);
    if (sticker) return sticker;
  }
  return null;
};

// ========================================
// Funcao para Buscar Pack por ID
// ========================================
export const findPackById = (packId: string): StickerPack | null => {
  return STICKER_PACKS.find((p) => p.id === packId) || null;
};
