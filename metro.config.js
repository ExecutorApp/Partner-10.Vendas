// Metro config do projeto Partners App
// Limita resolucao de modulos ao diretorio do projeto
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Garante que o Metro nao resolva modulos fora do projeto
config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
