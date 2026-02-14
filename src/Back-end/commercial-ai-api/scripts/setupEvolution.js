// ========================================
// Script de Setup Evolution API
// Configura webhooks para todas instancias
// ========================================

// ========================================
// Imports
// ========================================
const axios = require('axios');
require('dotenv').config();

// ========================================
// Configuracao
// ========================================
const EVOLUTION_URL = process.env.EVOLUTION_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WEBHOOK_URL = `${BACKEND_URL}/api/evolution/webhook`;

// ========================================
// Headers
// ========================================
const headers = {
  'apikey': EVOLUTION_API_KEY,                   //......Chave da API
  'Content-Type': 'application/json',            //......Tipo de conteudo
};

// ========================================
// Eventos para Webhook
// ========================================
const WEBHOOK_EVENTS = [
  'QRCODE_UPDATED',                              //......QR Code atualizado
  'MESSAGES_UPSERT',                             //......Mensagem recebida
  'MESSAGES_UPDATE',                             //......Mensagem atualizada
  'MESSAGES_DELETE',                             //......Mensagem deletada
  'SEND_MESSAGE',                                //......Mensagem enviada
  'PRESENCE_UPDATE',                             //......Presenca atualizada
  'CONNECTION_UPDATE',                           //......Conexao atualizada
  'CALL',                                        //......Chamada
];

// ========================================
// Listar Instancias
// ========================================
async function listInstances() {
  try {
    console.log('📋 Listando instâncias...');

    const response = await axios.get(
      `${EVOLUTION_URL}/instance/fetchInstances`,
      { headers }
    );

    return response.data || [];
  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error.message);
    return [];
  }
}

// ========================================
// Configurar Webhook para Instancia
// ========================================
async function setupWebhook(instanceName) {
  try {
    console.log(`🔧 Configurando webhook para: ${instanceName}`);

    const webhookConfig = {
      enabled: true,                             //......Habilitado
      url: `${WEBHOOK_URL}/${instanceName}`,     //......URL do webhook
      webhookByEvents: true,                     //......Eventos separados
      webhookBase64: false,                      //......Sem base64
      events: WEBHOOK_EVENTS,                    //......Eventos
    };

    await axios.post(
      `${EVOLUTION_URL}/webhook/set/${instanceName}`,
      webhookConfig,
      { headers }
    );

    console.log(`✅ Webhook configurado: ${instanceName}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao configurar webhook (${instanceName}):`, error.message);
    return false;
  }
}

// ========================================
// Verificar Webhook de Instancia
// ========================================
async function checkWebhook(instanceName) {
  try {
    const response = await axios.get(
      `${EVOLUTION_URL}/webhook/find/${instanceName}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    return null;
  }
}

// ========================================
// Criar Instancia de Teste
// ========================================
async function createTestInstance() {
  try {
    console.log('🆕 Criando instância de teste...');

    const instanceName = `test-${Date.now()}`;

    const response = await axios.post(
      `${EVOLUTION_URL}/instance/create`,
      {
        instanceName: instanceName,
        token: Math.random().toString(36).substring(2),
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      },
      { headers }
    );

    console.log(`✅ Instância criada: ${instanceName}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error.message);
    return null;
  }
}

// ========================================
// Verificar Conexao com Evolution API
// ========================================
async function checkConnection() {
  try {
    console.log('🔌 Verificando conexão com Evolution API...');
    console.log(`   URL: ${EVOLUTION_URL}`);

    const response = await axios.get(
      `${EVOLUTION_URL}/instance/fetchInstances`,
      { headers }
    );

    console.log('✅ Conexão OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('   Verifique se a Evolution API está rodando.');
    return false;
  }
}

// ========================================
// Funcao Principal
// ========================================
async function main() {
  console.log('========================================');
  console.log('  Setup Evolution API - Webhooks');
  console.log('========================================');
  console.log('');

  // Verificar conexao
  const connected = await checkConnection();
  if (!connected) {
    console.log('');
    console.log('⚠️  Configure as variáveis de ambiente:');
    console.log('   EVOLUTION_URL=http://localhost:8080');
    console.log('   EVOLUTION_API_KEY=sua-chave-aqui');
    console.log('   BACKEND_URL=http://localhost:3001');
    process.exit(1);
  }

  console.log('');

  // Listar instancias
  const instances = await listInstances();

  if (instances.length === 0) {
    console.log('📭 Nenhuma instância encontrada.');
    console.log('   As instâncias serão criadas quando os vendedores');
    console.log('   conectarem seus WhatsApps.');
    console.log('');
    console.log('========================================');
    console.log('✅ Setup concluído!');
    console.log('========================================');
    return;
  }

  console.log(`📦 ${instances.length} instância(s) encontrada(s)`);
  console.log('');

  // Configurar webhook para cada instancia
  let success = 0;
  let failed = 0;

  for (const instance of instances) {
    const instanceName = instance.instance?.instanceName;
    if (instanceName) {
      const ok = await setupWebhook(instanceName);
      if (ok) {
        success++;
      } else {
        failed++;
      }
    }
  }

  console.log('');
  console.log('========================================');
  console.log('  Resultado');
  console.log('========================================');
  console.log(`  ✅ Configurados: ${success}`);
  console.log(`  ❌ Falharam: ${failed}`);
  console.log(`  📦 Total: ${instances.length}`);
  console.log('========================================');
  console.log('');
  console.log('🔗 Webhook URL base:', WEBHOOK_URL);
  console.log('');
}

// ========================================
// Executar
// ========================================
main().catch(console.error);
