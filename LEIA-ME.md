# Jogos Enzola 3.4 — como publicar

Faça os passos na ordem. Os passos 1 e 3 são no painel do Supabase; o passo 2 é no GitHub (a Vercel publica sozinha).

## 1. Banco (obrigatório)
Supabase > SQL Editor > New query > cole o `migracao.sql` inteiro > Run.
Pode rodar de novo sem problema: nada é apagado nem duplicado. Nesta versão ele adiciona:
- coluna `steam_id` nos jogos (jogos que só existem na Steam, como "Fart Together");
- tabela `push_subscriptions` (aparelhos que recebem notificações) e `app_secrets` (chaves internas, sem acesso pelo site);
- gatilho que avisa a função quando chega cutucada, sugestão, mensagem ou pedido de amizade.

Se aparecer erro em `pg_net`: Database > Extensions > procure **pg_net** > Enable, e rode o SQL de novo.

## 2. Arquivos (GitHub)
Substitua tudo no repositório pelos arquivos deste pacote: `index.html`, `styles.css`, `app.js`, `jogo.js`,
`social.js`, `lingo.js`, `extras.js`, `config.js`, `sw.js`, `vercel.json`, `manifest.webmanifest`, `hipopotamo.webp`,
`logo.png`, `og-image.png`, as pastas `icons/`, `convite/`, `musica/`, `patrocinadores/` e `supabase/`.
Apague do repositório, se existirem: `hipopotamo.png`, `musica.mp3` (agora as músicas ficam na pasta `musica/`)
e a pasta `supabase/functions/precos`.

## 3. Função do servidor (publique de novo — ela mudou)
Supabase > Edge Functions > **enzola** > Code > cole o novo `supabase/functions/enzola/index.ts` > Deploy.
(Se ainda não existir: Deploy a new function > nome **enzola**.)

Ela agora também faz:
- **busca** na Steam, para achar jogos novos/indie que a RAWG ainda não tem;
- **notificações no celular**. As chaves de notificação são criadas sozinhas na primeira vez que alguém ativa —
  não é preciso configurar nada, e nenhuma chave secreta fica no GitHub.

Segredos opcionais (Edge Functions > Secrets): `ITAD_KEY` (preços em reais), `YOUTUBE_KEY` (vídeos), `YOUTUBE_CHANNELS`.

## 4. Login com e-mail de verdade (Supabase > Authentication)
- **Sign In / Providers > Email**: Confirm email pode ficar ligado (recomendado) ou desligado. **Secure email change** desligado.
- **URL Configuration**: Site URL = `https://jogos-enzola.vercel.app` e, em Redirect URLs, adicione `https://jogos-enzola.vercel.app/**`.
  Sem isso, os links de "confirmar e-mail" e "esqueci minha senha" abrem `localhost` e dão erro.
- **E-mails (SMTP)**: o envio padrão do Supabase só manda para quem é da equipe do projeto e no máximo 2 por hora.
  Para os membros receberem confirmação e recuperação de senha, configure um SMTP próprio
  (Project Settings > Authentication > SMTP Settings). Opções grátis: Brevo ou Resend.
- Contas antigas (criadas com usuário) continuam entrando com o usuário e a senha. Em Configurações aparece um aviso
  para elas cadastrarem o e-mail verdadeiro, que passa a servir para recuperar a senha.

## 5. Notificações no celular — o que cada um precisa fazer
- **Android e computador**: Configurações > Notificações > "Notificações no celular" (ou o convite no sininho) > permitir.
- **iPhone (iOS 16.4 ou mais novo)**: primeiro instalar o app (Safari > Compartilhar > Adicionar à Tela de Início),
  abrir pelo ícone e ativar por lá. A Apple não deixa sites mandarem notificação fora do app instalado.
- Ao sair da conta, o aparelho para de receber as notificações dela.

## 6. Tela de abertura e música
- **Abertura**: toda vez que alguém abre o site aparece o hipopótamo com o elenco, balões e fogos, com o áudio
  `musica/entrada.mp3` em looping. Os navegadores só liberam som depois do primeiro toque, por isso existe o botão
  "Toque para ouvir". "Entrar" (ou Enter) fecha a abertura. Quem abre o site tocando numa notificação vai direto
  para a tela certa, sem abertura.
- **Playlist**: 16 músicas do Silvio Santos em `musica/`, em ordem aleatória, uma depois da outra, em volume ambiente.
  O botão discreto no canto inferior esquerdo abre anterior / pausar / próxima e "Desativar música", que pede
  confirmação. Arrastar o botão para baixo também pergunta. Para religar ou mudar o volume:
  Configurações > Aparência > Música de fundo. No celular, os controles também aparecem na tela de bloqueio.
- Para trocar ou incluir músicas: coloque o MP3 em `musica/` e acrescente o nome na lista `PLAYLIST` do `extras.js`.

## 7. Patrocinadores
As logos ficam em `patrocinadores/` (PNG sem fundo, em uma cor só; o site pinta na cor do tema).
Para incluir outro, adicione um item na lista `.sp-list` do `index.html`, mantendo a ordem alfabética.

## 8. Enzolingo (aba Idiomas)
Mini Duolingo de inglês e espanhol com o hipopótamo: 4 unidades com 3 lições cada (8 perguntas), 3 vidas por lição,
XP, meta diária de 30 XP, ofensiva de dias seguidos e o Desafio de 60 segundos. A pronúncia usa a voz do próprio
aparelho. O progresso fica salvo na conta. Para incluir frases, edite a lista `LG_UNITS` no `lingo.js`.

## 9. Abas
Lista de desejos e Resumo agora ficam dentro do Catálogo (sub-abas no topo). Os links antigos (`#desejos`, `#resumo`)
continuam funcionando.

## 10. Se a busca disser que a chave da RAWG foi recusada
A chave grátis da RAWG tem limite mensal. Crie outra em https://rawg.io/apidocs e troque `RAWG_KEY` no `config.js`.
Com a função publicada, a busca continua achando jogos pela Steam mesmo com a RAWG fora.

## 11. Salas (chat e chamadas por grupo)
1. **Banco:** rode o `migracao.sql` de novo. O final dele cria a tabela `group_messages` (se ainda não existir) e as regras
   que deixam só os membros do grupo entrarem no canal da chamada (`realtime.messages`).
   No Supabase, em Realtime > Settings, deixe desligado "Allow public access" (os canais das salas são privados).
2. **Função:** publique de novo o `supabase/functions/enzola/index.ts` (ganhou a ação `turn`).
3. **TURN (recomendado):** sem ele, chamadas entre pessoas no 4G ou em redes com firewall podem não conectar.
   - Cloudflare (grátis para pouco uso): painel da Cloudflare > Realtime > TURN Server > Create. Copie o *Token ID* e o
     *API Token* e crie os segredos `CF_TURN_KEY_ID` e `CF_TURN_API_TOKEN` em Edge Functions > Secrets.
   - Ou outro provedor com usuário e senha fixos: segredos `TURN_URLS` (separadas por vírgula), `TURN_USERNAME` e `TURN_CREDENTIAL`.
   Nenhuma chave fica no GitHub: o site pede as credenciais à função na hora de entrar na sala.
4. **Celular:** os navegadores do Android e do iPhone não deixam sites transmitirem a tela (limitação do sistema).
   No celular o botão "Tela" explica isso e oferece a **câmera** (frontal ou traseira). No computador a tela funciona normalmente.
5. Entrar numa sala em outro aparelho encerra a chamada no aparelho anterior (igual ao Discord).
