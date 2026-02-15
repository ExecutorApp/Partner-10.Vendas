// Metro config do projeto Partners App
// Limita resolucao de modulos ao diretorio do projeto
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Garante que o Metro nao resolva modulos fora do projeto
config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Forca o async-require para o node_modules deste projeto (evita resolver de projetos vizinhos)
config.transformer = {
  ...config.transformer,
  asyncRequireModulePath: path.resolve(__dirname, 'node_modules', '@expo', 'metro-config', 'build', 'async-require'),
};

module.exports = config;
