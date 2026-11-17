# Jogos Enzola 3.2 — como publicar

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
`social.js`, `extras.js`, `config.js`, `sw.js`, `manifest.webmanifest`, `musica.mp3`, `hipopotamo.webp`,
`logo.png`, `og-image.png`, as pastas `icons/`, `convite/` e `supabase/`.
Apague do repositório: `hipopotamo.png` e a pasta `supabase/functions/precos` (não são mais usados).

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

## 6. Música de fundo
`musica.mp3` toca em looping, em volume ambiente. Os navegadores só liberam som depois do primeiro toque na página,
então ela começa no primeiro clique. Cada pessoa pode desligar no botão de nota musical (canto inferior esquerdo)
(tocar nele ou arrastar para baixo desliga a música e tira o botão da tela). Para religar ou ajustar o volume: Configurações > Aparência > Música de fundo. A escolha fica salva no aparelho.

## 7. Se a busca disser que a chave da RAWG foi recusada
A chave grátis da RAWG tem limite mensal. Crie outra em https://rawg.io/apidocs e troque `RAWG_KEY` no `config.js`.
Com a função publicada, a busca continua achando jogos pela Steam mesmo com a RAWG fora.
