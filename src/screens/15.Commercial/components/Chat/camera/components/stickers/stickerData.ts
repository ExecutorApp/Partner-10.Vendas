// ========================================
// Dados dos Stickers
// Categorias e emojis disponiveis
// ========================================

// ========================================
// Tipos de Sticker
// ========================================
export interface Sticker {
  id: string;                               //......ID unico
  emoji: string;                            //......Emoji Unicode
}

export interface StickerCategory {
  id: string;                               //......ID da categoria
  name: string;                             //......Nome da categoria
  icon: string;                             //......Icone da categoria
  stickers: Sticker[];                      //......Lista de stickers
}

// ========================================
// Categorias de Stickers
// ========================================
export const STICKER_CATEGORIES: StickerCategory[] = [
  // ========================================
  // Carinhas e Emocoes
  // ========================================
  {
    id: 'smileys',
    name: 'Carinhas',
    icon: '😀',
    stickers: [
      { id: 's01', emoji: '😀' },
      { id: 's02', emoji: '😃' },
      { id: 's03', emoji: '😄' },
      { id: 's04', emoji: '😁' },
      { id: 's05', emoji: '😅' },
      { id: 's06', emoji: '😂' },
      { id: 's07', emoji: '🤣' },
      { id: 's08', emoji: '😊' },
      { id: 's09', emoji: '😇' },
      { id: 's10', emoji: '🥰' },
      { id: 's11', emoji: '😍' },
      { id: 's12', emoji: '🤩' },
      { id: 's13', emoji: '😘' },
      { id: 's14', emoji: '😋' },
      { id: 's15', emoji: '😜' },
      { id: 's16', emoji: '🤪' },
      { id: 's17', emoji: '😎' },
      { id: 's18', emoji: '🤓' },
      { id: 's19', emoji: '🥳' },
      { id: 's20', emoji: '😏' },
      { id: 's21', emoji: '😌' },
      { id: 's22', emoji: '😴' },
      { id: 's23', emoji: '🤤' },
      { id: 's24', emoji: '😷' },
    ],
  },

  // ========================================
  // Gestos e Maos
  // ========================================
  {
    id: 'gestures',
    name: 'Gestos',
    icon: '👍',
    stickers: [
      { id: 'g01', emoji: '👍' },
      { id: 'g02', emoji: '👎' },
      { id: 'g03', emoji: '👌' },
      { id: 'g04', emoji: '✌️' },
      { id: 'g05', emoji: '🤞' },
      { id: 'g06', emoji: '🤟' },
      { id: 'g07', emoji: '🤙' },
      { id: 'g08', emoji: '👋' },
      { id: 'g09', emoji: '👏' },
      { id: 'g10', emoji: '🙌' },
      { id: 'g11', emoji: '🤝' },
      { id: 'g12', emoji: '🙏' },
      { id: 'g13', emoji: '💪' },
      { id: 'g14', emoji: '✍️' },
      { id: 'g15', emoji: '🤳' },
      { id: 'g16', emoji: '👆' },
      { id: 'g17', emoji: '👇' },
      { id: 'g18', emoji: '👈' },
      { id: 'g19', emoji: '👉' },
      { id: 'g20', emoji: '🖕' },
      { id: 'g21', emoji: '✊' },
      { id: 'g22', emoji: '👊' },
      { id: 'g23', emoji: '🤛' },
      { id: 'g24', emoji: '🤜' },
    ],
  },

  // ========================================
  // Coracoes e Amor
  // ========================================
  {
    id: 'hearts',
    name: 'Coracoes',
    icon: '❤️',
    stickers: [
      { id: 'h01', emoji: '❤️' },
      { id: 'h02', emoji: '🧡' },
      { id: 'h03', emoji: '💛' },
      { id: 'h04', emoji: '💚' },
      { id: 'h05', emoji: '💙' },
      { id: 'h06', emoji: '💜' },
      { id: 'h07', emoji: '🖤' },
      { id: 'h08', emoji: '🤍' },
      { id: 'h09', emoji: '🤎' },
      { id: 'h10', emoji: '💕' },
      { id: 'h11', emoji: '💞' },
      { id: 'h12', emoji: '💓' },
      { id: 'h13', emoji: '💗' },
      { id: 'h14', emoji: '💖' },
      { id: 'h15', emoji: '💘' },
      { id: 'h16', emoji: '💝' },
      { id: 'h17', emoji: '💟' },
      { id: 'h18', emoji: '❣️' },
      { id: 'h19', emoji: '💔' },
      { id: 'h20', emoji: '😻' },
      { id: 'h21', emoji: '💏' },
      { id: 'h22', emoji: '💑' },
      { id: 'h23', emoji: '💋' },
      { id: 'h24', emoji: '🥰' },
    ],
  },

  // ========================================
  // Objetos e Celebracao
  // ========================================
  {
    id: 'objects',
    name: 'Objetos',
    icon: '🎁',
    stickers: [
      { id: 'o01', emoji: '🎁' },
      { id: 'o02', emoji: '🎈' },
      { id: 'o03', emoji: '🎉' },
      { id: 'o04', emoji: '🎊' },
      { id: 'o05', emoji: '🔥' },
      { id: 'o06', emoji: '⭐' },
      { id: 'o07', emoji: '✨' },
      { id: 'o08', emoji: '💫' },
      { id: 'o09', emoji: '🌟' },
      { id: 'o10', emoji: '💥' },
      { id: 'o11', emoji: '💯' },
      { id: 'o12', emoji: '🏆' },
      { id: 'o13', emoji: '🥇' },
      { id: 'o14', emoji: '🎯' },
      { id: 'o15', emoji: '🎵' },
      { id: 'o16', emoji: '🎶' },
      { id: 'o17', emoji: '📱' },
      { id: 'o18', emoji: '💻' },
      { id: 'o19', emoji: '📷' },
      { id: 'o20', emoji: '🎥' },
      { id: 'o21', emoji: '💡' },
      { id: 'o22', emoji: '💰' },
      { id: 'o23', emoji: '💎' },
      { id: 'o24', emoji: '🎮' },
    ],
  },

  // ========================================
  // Animais
  // ========================================
  {
    id: 'animals',
    name: 'Animais',
    icon: '🐶',
    stickers: [
      { id: 'a01', emoji: '🐶' },
      { id: 'a02', emoji: '🐱' },
      { id: 'a03', emoji: '🐭' },
      { id: 'a04', emoji: '🐹' },
      { id: 'a05', emoji: '🐰' },
      { id: 'a06', emoji: '🦊' },
      { id: 'a07', emoji: '🐻' },
      { id: 'a08', emoji: '🐼' },
      { id: 'a09', emoji: '🐨' },
      { id: 'a10', emoji: '🦁' },
      { id: 'a11', emoji: '🐯' },
      { id: 'a12', emoji: '🐮' },
      { id: 'a13', emoji: '🐷' },
      { id: 'a14', emoji: '🐸' },
      { id: 'a15', emoji: '🐵' },
      { id: 'a16', emoji: '🐔' },
      { id: 'a17', emoji: '🐧' },
      { id: 'a18', emoji: '🐦' },
      { id: 'a19', emoji: '🦋' },
      { id: 'a20', emoji: '🐝' },
      { id: 'a21', emoji: '🐢' },
      { id: 'a22', emoji: '🦄' },
      { id: 'a23', emoji: '🐙' },
      { id: 'a24', emoji: '🦀' },
    ],
  },

  // ========================================
  // Comida e Bebida
  // ========================================
  {
    id: 'food',
    name: 'Comida',
    icon: '🍕',
    stickers: [
      { id: 'f01', emoji: '🍕' },
      { id: 'f02', emoji: '🍔' },
      { id: 'f03', emoji: '🍟' },
      { id: 'f04', emoji: '🌭' },
      { id: 'f05', emoji: '🍿' },
      { id: 'f06', emoji: '🍩' },
      { id: 'f07', emoji: '🍦' },
      { id: 'f08', emoji: '🎂' },
      { id: 'f09', emoji: '🍰' },
      { id: 'f10', emoji: '🍫' },
      { id: 'f11', emoji: '🍭' },
      { id: 'f12', emoji: '🍪' },
      { id: 'f13', emoji: '☕' },
      { id: 'f14', emoji: '🍺' },
      { id: 'f15', emoji: '🍷' },
      { id: 'f16', emoji: '🍹' },
      { id: 'f17', emoji: '🥤' },
      { id: 'f18', emoji: '🍎' },
      { id: 'f19', emoji: '🍌' },
      { id: 'f20', emoji: '🍇' },
      { id: 'f21', emoji: '🍓' },
      { id: 'f22', emoji: '🥑' },
      { id: 'f23', emoji: '🌮' },
      { id: 'f24', emoji: '🍣' },
    ],
  },
];
