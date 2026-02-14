// ========================================
// Catalogo de Figurinhas Locais
// Stickers PNG armazenados em assets/Tickers
// ========================================

// ========================================
// Tipos
// ========================================
export interface LocalSticker {
  id: string; //.....Identificador unico
  source: any; //....Require do PNG
}

export interface LocalStickerPack {
  id: string; //......Identificador do pack
  name: string; //....Nome exibido
  icon: any; //.......Icone do pack
  stickers: LocalSticker[]; //...Lista de stickers
}

// ========================================
// Pack: Caretas (28 stickers)
// ========================================
const PACK_CARETAS: LocalStickerPack = {
  id: 'caretas', //.........Identificador
  name: 'Caretas', //.......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Caretas/202.png'), //...Icone
  stickers: [
    { id: 'caretas_202', source: require('../../../../../../../../assets/Tickers/Caretas/202.png') },
    { id: 'caretas_203', source: require('../../../../../../../../assets/Tickers/Caretas/203.png') },
    { id: 'caretas_204', source: require('../../../../../../../../assets/Tickers/Caretas/204.png') },
    { id: 'caretas_205', source: require('../../../../../../../../assets/Tickers/Caretas/205.png') },
    { id: 'caretas_206', source: require('../../../../../../../../assets/Tickers/Caretas/206.png') },
    { id: 'caretas_207', source: require('../../../../../../../../assets/Tickers/Caretas/207.png') },
    { id: 'caretas_216', source: require('../../../../../../../../assets/Tickers/Caretas/216.png') },
    { id: 'caretas_217', source: require('../../../../../../../../assets/Tickers/Caretas/217.png') },
    { id: 'caretas_218', source: require('../../../../../../../../assets/Tickers/Caretas/218.png') },
    { id: 'caretas_219', source: require('../../../../../../../../assets/Tickers/Caretas/219.png') },
    { id: 'caretas_220', source: require('../../../../../../../../assets/Tickers/Caretas/220.png') },
    { id: 'caretas_221', source: require('../../../../../../../../assets/Tickers/Caretas/221.png') },
    { id: 'caretas_24', source: require('../../../../../../../../assets/Tickers/Caretas/24.png') },
    { id: 'caretas_25', source: require('../../../../../../../../assets/Tickers/Caretas/25.png') },
    { id: 'caretas_26', source: require('../../../../../../../../assets/Tickers/Caretas/26.png') },
    { id: 'caretas_31', source: require('../../../../../../../../assets/Tickers/Caretas/31.png') },
    { id: 'caretas_32', source: require('../../../../../../../../assets/Tickers/Caretas/32.png') },
    { id: 'caretas_33', source: require('../../../../../../../../assets/Tickers/Caretas/33.png') },
    { id: 'caretas_34', source: require('../../../../../../../../assets/Tickers/Caretas/34.png') },
    { id: 'caretas_35', source: require('../../../../../../../../assets/Tickers/Caretas/35.png') },
    { id: 'caretas_36', source: require('../../../../../../../../assets/Tickers/Caretas/36.png') },
    { id: 'caretas_37', source: require('../../../../../../../../assets/Tickers/Caretas/37.png') },
    { id: 'caretas_38', source: require('../../../../../../../../assets/Tickers/Caretas/38.png') },
    { id: 'caretas_39', source: require('../../../../../../../../assets/Tickers/Caretas/39.png') },
    { id: 'caretas_40', source: require('../../../../../../../../assets/Tickers/Caretas/40.png') },
    { id: 'caretas_41', source: require('../../../../../../../../assets/Tickers/Caretas/41.png') },
    { id: 'caretas_42', source: require('../../../../../../../../assets/Tickers/Caretas/42.png') },
    { id: 'caretas_43', source: require('../../../../../../../../assets/Tickers/Caretas/43.png') },
  ],
};

// ========================================
// Pack: Emogis (13 stickers)
// ========================================
const PACK_EMOGIS: LocalStickerPack = {
  id: 'emogis', //..........Identificador
  name: 'Emogis', //.......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Emogis/227.png'), //...Icone
  stickers: [
    { id: 'emogis_227', source: require('../../../../../../../../assets/Tickers/Emogis/227.png') },
    { id: 'emogis_228', source: require('../../../../../../../../assets/Tickers/Emogis/228.png') },
    { id: 'emogis_229', source: require('../../../../../../../../assets/Tickers/Emogis/229.png') },
    { id: 'emogis_230', source: require('../../../../../../../../assets/Tickers/Emogis/230.png') },
    { id: 'emogis_231', source: require('../../../../../../../../assets/Tickers/Emogis/231.png') },
    { id: 'emogis_232', source: require('../../../../../../../../assets/Tickers/Emogis/232.png') },
    { id: 'emogis_233', source: require('../../../../../../../../assets/Tickers/Emogis/233.png') },
    { id: 'emogis_234', source: require('../../../../../../../../assets/Tickers/Emogis/234.png') },
    { id: 'emogis_235', source: require('../../../../../../../../assets/Tickers/Emogis/235.png') },
    { id: 'emogis_236', source: require('../../../../../../../../assets/Tickers/Emogis/236.png') },
    { id: 'emogis_237', source: require('../../../../../../../../assets/Tickers/Emogis/237.png') },
    { id: 'emogis_238', source: require('../../../../../../../../assets/Tickers/Emogis/238.png') },
    { id: 'emogis_239', source: require('../../../../../../../../assets/Tickers/Emogis/239.png') },
  ],
};

// ========================================
// Pack: Esporte (10 stickers)
// ========================================
const PACK_ESPORTE: LocalStickerPack = {
  id: 'esporte', //.........Identificador
  name: 'Esporte', //......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Esporte/95.png'), //...Icone
  stickers: [
    { id: 'esporte_95', source: require('../../../../../../../../assets/Tickers/Esporte/95.png') },
    { id: 'esporte_96', source: require('../../../../../../../../assets/Tickers/Esporte/96.png') },
    { id: 'esporte_97', source: require('../../../../../../../../assets/Tickers/Esporte/97.png') },
    { id: 'esporte_98', source: require('../../../../../../../../assets/Tickers/Esporte/98.png') },
    { id: 'esporte_99', source: require('../../../../../../../../assets/Tickers/Esporte/99.png') },
    { id: 'esporte_100', source: require('../../../../../../../../assets/Tickers/Esporte/100.png') },
    { id: 'esporte_101', source: require('../../../../../../../../assets/Tickers/Esporte/101.png') },
    { id: 'esporte_102', source: require('../../../../../../../../assets/Tickers/Esporte/102.png') },
    { id: 'esporte_103', source: require('../../../../../../../../assets/Tickers/Esporte/103.png') },
    { id: 'esporte_104', source: require('../../../../../../../../assets/Tickers/Esporte/104.png') },
  ],
};

// ========================================
// Pack: Laranja (12 stickers)
// ========================================
const PACK_LARANJA: LocalStickerPack = {
  id: 'laranja', //.........Identificador
  name: 'Laranja', //......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Laranja/190.png'), //...Icone
  stickers: [
    { id: 'laranja_190', source: require('../../../../../../../../assets/Tickers/Laranja/190.png') },
    { id: 'laranja_191', source: require('../../../../../../../../assets/Tickers/Laranja/191.png') },
    { id: 'laranja_192', source: require('../../../../../../../../assets/Tickers/Laranja/192.png') },
    { id: 'laranja_193', source: require('../../../../../../../../assets/Tickers/Laranja/193.png') },
    { id: 'laranja_194', source: require('../../../../../../../../assets/Tickers/Laranja/194.png') },
    { id: 'laranja_195', source: require('../../../../../../../../assets/Tickers/Laranja/195.png') },
    { id: 'laranja_196', source: require('../../../../../../../../assets/Tickers/Laranja/196.png') },
    { id: 'laranja_197', source: require('../../../../../../../../assets/Tickers/Laranja/197.png') },
    { id: 'laranja_198', source: require('../../../../../../../../assets/Tickers/Laranja/198.png') },
    { id: 'laranja_199', source: require('../../../../../../../../assets/Tickers/Laranja/199.png') },
    { id: 'laranja_200', source: require('../../../../../../../../assets/Tickers/Laranja/200.png') },
    { id: 'laranja_201', source: require('../../../../../../../../assets/Tickers/Laranja/201.png') },
  ],
};

// ========================================
// Pack: Maca (50 stickers)
// ========================================
const PACK_MACA: LocalStickerPack = {
  id: 'maca', //............Identificador
  name: 'Maçã', //.........Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Maça/44.png'), //...Icone
  stickers: [
    { id: 'maca_44', source: require('../../../../../../../../assets/Tickers/Maça/44.png') },
    { id: 'maca_45', source: require('../../../../../../../../assets/Tickers/Maça/45.png') },
    { id: 'maca_46', source: require('../../../../../../../../assets/Tickers/Maça/46.png') },
    { id: 'maca_47', source: require('../../../../../../../../assets/Tickers/Maça/47.png') },
    { id: 'maca_48', source: require('../../../../../../../../assets/Tickers/Maça/48.png') },
    { id: 'maca_49', source: require('../../../../../../../../assets/Tickers/Maça/49.png') },
    { id: 'maca_50', source: require('../../../../../../../../assets/Tickers/Maça/50.png') },
    { id: 'maca_51', source: require('../../../../../../../../assets/Tickers/Maça/51.png') },
    { id: 'maca_52', source: require('../../../../../../../../assets/Tickers/Maça/52.png') },
    { id: 'maca_53', source: require('../../../../../../../../assets/Tickers/Maça/53.png') },
    { id: 'maca_54', source: require('../../../../../../../../assets/Tickers/Maça/54.png') },
    { id: 'maca_55', source: require('../../../../../../../../assets/Tickers/Maça/55.png') },
    { id: 'maca_56', source: require('../../../../../../../../assets/Tickers/Maça/56.png') },
    { id: 'maca_57', source: require('../../../../../../../../assets/Tickers/Maça/57.png') },
    { id: 'maca_58', source: require('../../../../../../../../assets/Tickers/Maça/58.png') },
    { id: 'maca_59', source: require('../../../../../../../../assets/Tickers/Maça/59.png') },
    { id: 'maca_60', source: require('../../../../../../../../assets/Tickers/Maça/60.png') },
    { id: 'maca_61', source: require('../../../../../../../../assets/Tickers/Maça/61.png') },
    { id: 'maca_62', source: require('../../../../../../../../assets/Tickers/Maça/62.png') },
    { id: 'maca_63', source: require('../../../../../../../../assets/Tickers/Maça/63.png') },
    { id: 'maca_64', source: require('../../../../../../../../assets/Tickers/Maça/64.png') },
    { id: 'maca_65', source: require('../../../../../../../../assets/Tickers/Maça/65.png') },
    { id: 'maca_66', source: require('../../../../../../../../assets/Tickers/Maça/66.png') },
    { id: 'maca_67', source: require('../../../../../../../../assets/Tickers/Maça/67.png') },
    { id: 'maca_68', source: require('../../../../../../../../assets/Tickers/Maça/68.png') },
    { id: 'maca_69', source: require('../../../../../../../../assets/Tickers/Maça/69.png') },
    { id: 'maca_70', source: require('../../../../../../../../assets/Tickers/Maça/70.png') },
    { id: 'maca_71', source: require('../../../../../../../../assets/Tickers/Maça/71.png') },
    { id: 'maca_72', source: require('../../../../../../../../assets/Tickers/Maça/72.png') },
    { id: 'maca_73', source: require('../../../../../../../../assets/Tickers/Maça/73.png') },
    { id: 'maca_74', source: require('../../../../../../../../assets/Tickers/Maça/74.png') },
    { id: 'maca_75', source: require('../../../../../../../../assets/Tickers/Maça/75.png') },
    { id: 'maca_76', source: require('../../../../../../../../assets/Tickers/Maça/76.png') },
    { id: 'maca_77', source: require('../../../../../../../../assets/Tickers/Maça/77.png') },
    { id: 'maca_78', source: require('../../../../../../../../assets/Tickers/Maça/78.png') },
    { id: 'maca_79', source: require('../../../../../../../../assets/Tickers/Maça/79.png') },
    { id: 'maca_80', source: require('../../../../../../../../assets/Tickers/Maça/80.png') },
    { id: 'maca_81', source: require('../../../../../../../../assets/Tickers/Maça/81.png') },
    { id: 'maca_82', source: require('../../../../../../../../assets/Tickers/Maça/82.png') },
    { id: 'maca_83', source: require('../../../../../../../../assets/Tickers/Maça/83.png') },
    { id: 'maca_84', source: require('../../../../../../../../assets/Tickers/Maça/84.png') },
    { id: 'maca_85', source: require('../../../../../../../../assets/Tickers/Maça/85.png') },
    { id: 'maca_86', source: require('../../../../../../../../assets/Tickers/Maça/86.png') },
    { id: 'maca_87', source: require('../../../../../../../../assets/Tickers/Maça/87.png') },
    { id: 'maca_88', source: require('../../../../../../../../assets/Tickers/Maça/88.png') },
    { id: 'maca_89', source: require('../../../../../../../../assets/Tickers/Maça/89.png') },
    { id: 'maca_90', source: require('../../../../../../../../assets/Tickers/Maça/90.png') },
    { id: 'maca_91', source: require('../../../../../../../../assets/Tickers/Maça/91.png') },
    { id: 'maca_92', source: require('../../../../../../../../assets/Tickers/Maça/92.png') },
    { id: 'maca_93', source: require('../../../../../../../../assets/Tickers/Maça/93.png') },
  ],
};

// ========================================
// Pack: Macaco (20 stickers)
// ========================================
const PACK_MACACO: LocalStickerPack = {
  id: 'macaco', //..........Identificador
  name: 'Macaco', //.......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Macaco/170.png'), //...Icone
  stickers: [
    { id: 'macaco_170', source: require('../../../../../../../../assets/Tickers/Macaco/170.png') },
    { id: 'macaco_171', source: require('../../../../../../../../assets/Tickers/Macaco/171.png') },
    { id: 'macaco_172', source: require('../../../../../../../../assets/Tickers/Macaco/172.png') },
    { id: 'macaco_173', source: require('../../../../../../../../assets/Tickers/Macaco/173.png') },
    { id: 'macaco_174', source: require('../../../../../../../../assets/Tickers/Macaco/174.png') },
    { id: 'macaco_175', source: require('../../../../../../../../assets/Tickers/Macaco/175.png') },
    { id: 'macaco_176', source: require('../../../../../../../../assets/Tickers/Macaco/176.png') },
    { id: 'macaco_177', source: require('../../../../../../../../assets/Tickers/Macaco/177.png') },
    { id: 'macaco_178', source: require('../../../../../../../../assets/Tickers/Macaco/178.png') },
    { id: 'macaco_179', source: require('../../../../../../../../assets/Tickers/Macaco/179.png') },
    { id: 'macaco_180', source: require('../../../../../../../../assets/Tickers/Macaco/180.png') },
    { id: 'macaco_181', source: require('../../../../../../../../assets/Tickers/Macaco/181.png') },
    { id: 'macaco_182', source: require('../../../../../../../../assets/Tickers/Macaco/182.png') },
    { id: 'macaco_183', source: require('../../../../../../../../assets/Tickers/Macaco/183.png') },
    { id: 'macaco_184', source: require('../../../../../../../../assets/Tickers/Macaco/184.png') },
    { id: 'macaco_185', source: require('../../../../../../../../assets/Tickers/Macaco/185.png') },
    { id: 'macaco_186', source: require('../../../../../../../../assets/Tickers/Macaco/186.png') },
    { id: 'macaco_187', source: require('../../../../../../../../assets/Tickers/Macaco/187.png') },
    { id: 'macaco_188', source: require('../../../../../../../../assets/Tickers/Macaco/188.png') },
    { id: 'macaco_189', source: require('../../../../../../../../assets/Tickers/Macaco/189.png') },
  ],
};

// ========================================
// Pack: Maos (11 stickers)
// ========================================
const PACK_MAOS: LocalStickerPack = {
  id: 'maos', //............Identificador
  name: 'Mãos', //.........Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Mãos/09.png'), //...Icone
  stickers: [
    { id: 'maos_09', source: require('../../../../../../../../assets/Tickers/Mãos/09.png') },
    { id: 'maos_10', source: require('../../../../../../../../assets/Tickers/Mãos/10.png') },
    { id: 'maos_11', source: require('../../../../../../../../assets/Tickers/Mãos/11.png') },
    { id: 'maos_12', source: require('../../../../../../../../assets/Tickers/Mãos/12.png') },
    { id: 'maos_13', source: require('../../../../../../../../assets/Tickers/Mãos/13.png') },
    { id: 'maos_14', source: require('../../../../../../../../assets/Tickers/Mãos/14.png') },
    { id: 'maos_15', source: require('../../../../../../../../assets/Tickers/Mãos/15.png') },
    { id: 'maos_16', source: require('../../../../../../../../assets/Tickers/Mãos/16.png') },
    { id: 'maos_18', source: require('../../../../../../../../assets/Tickers/Mãos/18.png') },
    { id: 'maos_21', source: require('../../../../../../../../assets/Tickers/Mãos/21.png') },
    { id: 'maos_23', source: require('../../../../../../../../assets/Tickers/Mãos/23.png') },
  ],
};

// ========================================
// Pack: Outros (16 stickers)
// ========================================
const PACK_OUTROS: LocalStickerPack = {
  id: 'outros', //..........Identificador
  name: 'Outros', //.......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Outros/01.png'), //...Icone
  stickers: [
    { id: 'outros_01', source: require('../../../../../../../../assets/Tickers/Outros/01.png') },
    { id: 'outros_02', source: require('../../../../../../../../assets/Tickers/Outros/02.png') },
    { id: 'outros_03', source: require('../../../../../../../../assets/Tickers/Outros/03.png') },
    { id: 'outros_04', source: require('../../../../../../../../assets/Tickers/Outros/04.png') },
    { id: 'outros_05', source: require('../../../../../../../../assets/Tickers/Outros/05.png') },
    { id: 'outros_06', source: require('../../../../../../../../assets/Tickers/Outros/06.png') },
    { id: 'outros_07', source: require('../../../../../../../../assets/Tickers/Outros/07.png') },
    { id: 'outros_08', source: require('../../../../../../../../assets/Tickers/Outros/08.png') },
    { id: 'outros_17', source: require('../../../../../../../../assets/Tickers/Outros/17.png') },
    { id: 'outros_19', source: require('../../../../../../../../assets/Tickers/Outros/19.png') },
    { id: 'outros_20', source: require('../../../../../../../../assets/Tickers/Outros/20.png') },
    { id: 'outros_22', source: require('../../../../../../../../assets/Tickers/Outros/22.png') },
    { id: 'outros_27', source: require('../../../../../../../../assets/Tickers/Outros/27.png') },
    { id: 'outros_28', source: require('../../../../../../../../assets/Tickers/Outros/28.png') },
    { id: 'outros_29', source: require('../../../../../../../../assets/Tickers/Outros/29.png') },
    { id: 'outros_30', source: require('../../../../../../../../assets/Tickers/Outros/30.png') },
  ],
};

// ========================================
// Pack: Porco (15 stickers)
// ========================================
const PACK_PORCO: LocalStickerPack = {
  id: 'porco', //...........Identificador
  name: 'Porco', //........Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Porco/155.png'), //...Icone
  stickers: [
    { id: 'porco_155', source: require('../../../../../../../../assets/Tickers/Porco/155.png') },
    { id: 'porco_156', source: require('../../../../../../../../assets/Tickers/Porco/156.png') },
    { id: 'porco_157', source: require('../../../../../../../../assets/Tickers/Porco/157.png') },
    { id: 'porco_158', source: require('../../../../../../../../assets/Tickers/Porco/158.png') },
    { id: 'porco_159', source: require('../../../../../../../../assets/Tickers/Porco/159.png') },
    { id: 'porco_160', source: require('../../../../../../../../assets/Tickers/Porco/160.png') },
    { id: 'porco_161', source: require('../../../../../../../../assets/Tickers/Porco/161.png') },
    { id: 'porco_162', source: require('../../../../../../../../assets/Tickers/Porco/162.png') },
    { id: 'porco_163', source: require('../../../../../../../../assets/Tickers/Porco/163.png') },
    { id: 'porco_164', source: require('../../../../../../../../assets/Tickers/Porco/164.png') },
    { id: 'porco_165', source: require('../../../../../../../../assets/Tickers/Porco/165.png') },
    { id: 'porco_166', source: require('../../../../../../../../assets/Tickers/Porco/166.png') },
    { id: 'porco_167', source: require('../../../../../../../../assets/Tickers/Porco/167.png') },
    { id: 'porco_168', source: require('../../../../../../../../assets/Tickers/Porco/168.png') },
    { id: 'porco_169', source: require('../../../../../../../../assets/Tickers/Porco/169.png') },
  ],
};

// ========================================
// Pack: Tomate (50 stickers)
// ========================================
const PACK_TOMATE: LocalStickerPack = {
  id: 'tomate', //..........Identificador
  name: 'Tomate', //.......Nome exibido
  icon: require('../../../../../../../../assets/Tickers/Tomate/105.png'), //...Icone
  stickers: [
    { id: 'tomate_105', source: require('../../../../../../../../assets/Tickers/Tomate/105.png') },
    { id: 'tomate_106', source: require('../../../../../../../../assets/Tickers/Tomate/106.png') },
    { id: 'tomate_107', source: require('../../../../../../../../assets/Tickers/Tomate/107.png') },
    { id: 'tomate_108', source: require('../../../../../../../../assets/Tickers/Tomate/108.png') },
    { id: 'tomate_109', source: require('../../../../../../../../assets/Tickers/Tomate/109.png') },
    { id: 'tomate_110', source: require('../../../../../../../../assets/Tickers/Tomate/110.png') },
    { id: 'tomate_111', source: require('../../../../../../../../assets/Tickers/Tomate/111.png') },
    { id: 'tomate_112', source: require('../../../../../../../../assets/Tickers/Tomate/112.png') },
    { id: 'tomate_113', source: require('../../../../../../../../assets/Tickers/Tomate/113.png') },
    { id: 'tomate_114', source: require('../../../../../../../../assets/Tickers/Tomate/114.png') },
    { id: 'tomate_115', source: require('../../../../../../../../assets/Tickers/Tomate/115.png') },
    { id: 'tomate_116', source: require('../../../../../../../../assets/Tickers/Tomate/116.png') },
    { id: 'tomate_117', source: require('../../../../../../../../assets/Tickers/Tomate/117.png') },
    { id: 'tomate_118', source: require('../../../../../../../../assets/Tickers/Tomate/118.png') },
    { id: 'tomate_119', source: require('../../../../../../../../assets/Tickers/Tomate/119.png') },
    { id: 'tomate_120', source: require('../../../../../../../../assets/Tickers/Tomate/120.png') },
    { id: 'tomate_121', source: require('../../../../../../../../assets/Tickers/Tomate/121.png') },
    { id: 'tomate_122', source: require('../../../../../../../../assets/Tickers/Tomate/122.png') },
    { id: 'tomate_123', source: require('../../../../../../../../assets/Tickers/Tomate/123.png') },
    { id: 'tomate_124', source: require('../../../../../../../../assets/Tickers/Tomate/124.png') },
    { id: 'tomate_125', source: require('../../../../../../../../assets/Tickers/Tomate/125.png') },
    { id: 'tomate_126', source: require('../../../../../../../../assets/Tickers/Tomate/126.png') },
    { id: 'tomate_127', source: require('../../../../../../../../assets/Tickers/Tomate/127.png') },
    { id: 'tomate_128', source: require('../../../../../../../../assets/Tickers/Tomate/128.png') },
    { id: 'tomate_129', source: require('../../../../../../../../assets/Tickers/Tomate/129.png') },
    { id: 'tomate_130', source: require('../../../../../../../../assets/Tickers/Tomate/130.png') },
    { id: 'tomate_131', source: require('../../../../../../../../assets/Tickers/Tomate/131.png') },
    { id: 'tomate_132', source: require('../../../../../../../../assets/Tickers/Tomate/132.png') },
    { id: 'tomate_133', source: require('../../../../../../../../assets/Tickers/Tomate/133.png') },
    { id: 'tomate_134', source: require('../../../../../../../../assets/Tickers/Tomate/134.png') },
    { id: 'tomate_135', source: require('../../../../../../../../assets/Tickers/Tomate/135.png') },
    { id: 'tomate_136', source: require('../../../../../../../../assets/Tickers/Tomate/136.png') },
    { id: 'tomate_137', source: require('../../../../../../../../assets/Tickers/Tomate/137.png') },
    { id: 'tomate_138', source: require('../../../../../../../../assets/Tickers/Tomate/138.png') },
    { id: 'tomate_139', source: require('../../../../../../../../assets/Tickers/Tomate/139.png') },
    { id: 'tomate_140', source: require('../../../../../../../../assets/Tickers/Tomate/140.png') },
    { id: 'tomate_141', source: require('../../../../../../../../assets/Tickers/Tomate/141.png') },
    { id: 'tomate_142', source: require('../../../../../../../../assets/Tickers/Tomate/142.png') },
    { id: 'tomate_143', source: require('../../../../../../../../assets/Tickers/Tomate/143.png') },
    { id: 'tomate_144', source: require('../../../../../../../../assets/Tickers/Tomate/144.png') },
    { id: 'tomate_145', source: require('../../../../../../../../assets/Tickers/Tomate/145.png') },
    { id: 'tomate_146', source: require('../../../../../../../../assets/Tickers/Tomate/146.png') },
    { id: 'tomate_147', source: require('../../../../../../../../assets/Tickers/Tomate/147.png') },
    { id: 'tomate_148', source: require('../../../../../../../../assets/Tickers/Tomate/148.png') },
    { id: 'tomate_149', source: require('../../../../../../../../assets/Tickers/Tomate/149.png') },
    { id: 'tomate_150', source: require('../../../../../../../../assets/Tickers/Tomate/150.png') },
    { id: 'tomate_151', source: require('../../../../../../../../assets/Tickers/Tomate/151.png') },
    { id: 'tomate_152', source: require('../../../../../../../../assets/Tickers/Tomate/152.png') },
    { id: 'tomate_153', source: require('../../../../../../../../assets/Tickers/Tomate/153.png') },
    { id: 'tomate_154', source: require('../../../../../../../../assets/Tickers/Tomate/154.png') },
  ],
};

// ========================================
// Lista Completa de Packs
// ========================================
export const LOCAL_STICKER_PACKS: LocalStickerPack[] = [
  PACK_CARETAS, //...Pack Caretas
  PACK_EMOGIS, //....Pack Emogis
  PACK_ESPORTE, //...Pack Esporte
  PACK_LARANJA, //...Pack Laranja
  PACK_MACA, //.....Pack Maca
  PACK_MACACO, //....Pack Macaco
  PACK_MAOS, //.....Pack Maos
  PACK_OUTROS, //....Pack Outros
  PACK_PORCO, //....Pack Porco
  PACK_TOMATE, //....Pack Tomate
];

// ========================================
// Funcao Auxiliar para Buscar Sticker por ID
// ========================================
export const findStickerById = (id: string): LocalSticker | undefined => {
  for (const pack of LOCAL_STICKER_PACKS) {
    const sticker = pack.stickers.find((s) => s.id === id);
    if (sticker) return sticker;
  }
  return undefined;
};
