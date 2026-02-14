// Worker Cloudflare: Proxy para obter duracao de videos do Instagram
// Deploy: npx wrangler deploy --name ig-duration workers/instagram-duration-worker.js
// Apos deploy, copie a URL e cole em DURATION_WORKER_URL no 08.12.LinkPreviewCard.tsx
// Solucao 100% gratuita: Cloudflare Workers free tier + Instagram GraphQL publico

// doc_ids do GraphQL (mudam a cada 2-4 semanas)
const DOC_IDS = [
  '10015901848480474', //...doc_id primario
  '8845758582119845',  //...doc_id fallback
];

// Handler principal do Worker
export default {
  async fetch(request) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',             //...Permite qualquer origem
          'Access-Control-Allow-Methods': 'GET, OPTIONS', //...Metodos permitidos
          'Access-Control-Max-Age': '86400',              //...Cache preflight 24h
        },
      });
    }

    // Extrai shortcode do query param
    const url = new URL(request.url);                     //...Parseia URL
    const shortcode = url.searchParams.get('shortcode');  //...Parametro shortcode

    // Valida parametro
    if (!shortcode) {
      return jsonResponse({ error: 'Missing shortcode' }, 400);
    }

    try {
      // Busca sessao do Instagram (LSD token + cookies)
      const session = await fetchInstagramSession();       //...Sessao autenticada
      if (!session) {
        return jsonResponse({ duration: null, isVideo: false, error: 'No session' });
      }

      // Tenta cada doc_id ate obter resultado
      for (const docId of DOC_IDS) {
        const result = await fetchViaGraphQL(shortcode, docId, session);
        if (result && result.duration) {
          return jsonResponse(result);                     //...Retorna duracao
        }
      }

      // Nenhum doc_id retornou duracao
      return jsonResponse({ duration: null, isVideo: false, type: null });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);  //...Erro interno
    }
  },
};

// Busca sessao do Instagram (LSD token + cookies + CSRF)
async function fetchInstagramSession() {
  try {
    const pageRes = await fetch('https://www.instagram.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',       //...Aceita HTML
        'Accept-Language': 'en-US,en;q=0.9',               //...Idioma ingles
      },
    });

    // Extrai cookies da resposta
    const setCookie = pageRes.headers.get('set-cookie') || '';
    const cookies = setCookie.split(',')
      .map(c => c.split(';')[0].trim())                    //...Pega nome=valor
      .filter(c => c.includes('='))                         //...Filtra validos
      .join('; ');                                          //...Junta em string

    // Extrai CSRF token
    const csrf = (setCookie.match(/csrftoken=([^;]+)/) || [])[1] || '';

    // Extrai LSD token do HTML
    const html = await pageRes.text();                      //...HTML da pagina
    let lsd = null;
    const m1 = html.match(/"LSD"\s*,\s*\[\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/);
    if (m1) lsd = m1[1];
    if (!lsd) {
      const m2 = html.match(/\\"LSD\\"\s*,\s*\[\]\s*,\s*\{\s*\\"token\\"\s*:\s*\\"([^\\]+)\\"/);
      if (m2) lsd = m2[1];
    }
    if (!lsd) return null;                                  //...Sem token LSD

    return { cookies, csrf, lsd };                          //...Sessao completa
  } catch {
    return null;                                            //...Erro silencioso
  }
}

// Busca duracao via GraphQL API do Instagram
async function fetchViaGraphQL(shortcode, docId, session) {
  try {
    const body = new URLSearchParams({
      variables: JSON.stringify({ shortcode, fetch_tagged_user_count: null }),
      doc_id: docId,                                        //...ID do documento
      lsd: session.lsd,                                     //...Token LSD
    });

    const response = await fetch('https://www.instagram.com/api/graphql', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-IG-App-ID': '936619743392459',                  //...App ID publico
        'X-FB-LSD': session.lsd,                            //...Token LSD
        'X-ASBD-ID': '198387',                              //...ASBD ID
        'X-CSRFToken': session.csrf,                        //...Token CSRF
        'Sec-Fetch-Site': 'same-origin',                    //...Same origin
        'Origin': 'https://www.instagram.com',              //...Origem
        'Referer': 'https://www.instagram.com/',            //...Referencia
        'Cookie': session.cookies,                          //...Cookies da sessao
      },
      body: body.toString(),                                //...Corpo URL-encoded
    });

    const text = await response.text();                     //...Resposta texto
    let data;
    try { data = JSON.parse(text); } catch { return null; } //...Parseia JSON

    // Extrai duracao do media
    const media = data?.data?.xdt_shortcode_media;          //...Dados do media
    if (media && media.video_duration) {
      return {
        duration: media.video_duration,                     //...Duracao em segundos
        isVideo: true,                                      //...Eh video
        type: media.__typename || null,                     //...Tipo do media
        source: 'graphql',                                  //...Fonte
      };
    }

    return null;                                            //...Sem duracao
  } catch {
    return null;                                            //...Erro silencioso
  }
}

// Resposta JSON com CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',                   //...Tipo JSON
      'Access-Control-Allow-Origin': '*',                   //...CORS aberto
      'Cache-Control': 'public, max-age=86400',             //...Cache 24h
    },
  });
}
