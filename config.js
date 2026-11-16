// Preencha com os dados do seu projeto Supabase (Project Settings > API).
// A chave "anon" pode ficar aqui: quem protege os dados são as regras do banco (schema.sql + migracao.sql).
// NUNCA coloque a chave "service_role" neste arquivo.
window.APP_CONFIG = {
  SUPABASE_URL: "https://atijygnnmcnmrnaxilpi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0aWp5Z25ubWNubXJuYXhpbHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3Njg0NjksImV4cCI6MjExMDM0NDQ2OX0.gyyga0NGF5Jo64S4dRmUx9eeH8rx4iYVa0e110X1Pfc",
  // Chave gratuita em https://rawg.io/apidocs (deixe vazio para desligar a busca de jogos)
  RAWG_KEY: "56cfadacd55a4283a45ce415e7d346ab",

  // E-mail interno das contas novas. Hoje o usuário "pedro" vira "pedro@gmail.com", que é o
  // endereço de outra pessoa. Coloque aqui um Gmail SEU, ex.: "movimento.enzola@gmail.com",
  // e as contas novas viram "movimento.enzola+pedro@gmail.com" (qualquer e-mail cai na sua caixa).
  // As contas antigas continuam entrando normalmente. Vazio = comportamento antigo.
  EMAIL_BASE: "",

  // Função do servidor (pasta supabase/functions/enzola). Depois de publicar, escreva "enzola" aqui.
  // Ela ativa: "Esqueci minha senha", sinopse e análises em português, preço da Steam Brasil,
  // preços em reais de lojas brasileiras (com o segredo ITAD_KEY), vídeos do YouTube (com YOUTUBE_KEY)
  // e "Excluir conta". Vazio = o site funciona, sem esses extras.
  FUNCTION: "enzola",

  // Opcional: chave do YouTube só para o navegador (restrinja ao domínio do site no Google Cloud).
  // Prefira colocar a chave como segredo YOUTUBE_KEY na função, que guarda os vídeos em cache para todos.
  YOUTUBE_KEY: ""
};
