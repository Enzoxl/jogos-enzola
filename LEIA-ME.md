# Jogos Enzola 3.0 — como publicar

## 1. Banco (obrigatório, uma vez)
Supabase > SQL Editor > New query > cole o `migracao.sql` inteiro > Run.
Pode rodar de novo sem problema. Ele cria: ID de 4 dígitos para todos, mensagens, notificações,
cutucadas, sugestões, código de recuperação de senha, configurações e tempo real.

## 2. Arquivos
Substitua tudo no servidor: `index.html`, `styles.css`, `app.js`, `jogo.js`, `social.js`, `extras.js`,
`config.js`, `sw.js`, `manifest.webmanifest`, `og-image.png`, `logo.png` e a pasta `icons/`.

## 3. Função do servidor (recomendado)
Ativa: "Esqueci minha senha", sinopse e análises em português, preço da Steam Brasil,
preços em reais de lojas brasileiras, vídeos do YouTube e "Excluir conta".
1. Supabase > Edge Functions > Deploy a new function > nome **enzola** > cole `supabase/functions/enzola/index.ts` > Deploy.
2. No `config.js`, coloque `FUNCTION: "enzola"`.
3. Opcional, em Edge Functions > Secrets:
   - `ITAD_KEY`: chave grátis em isthereanydeal.com (preços em reais da Nuuvem, Steam BR, Epic, GOG…).
   - `YOUTUBE_KEY`: chave grátis do YouTube Data API v3 no Google Cloud (gameplay de youtubers brasileiros).
   - `YOUTUBE_CHANNELS`: lista de canais preferidos, separados por vírgula (já vem com alanzoka, BRKsEDU, Zangado, Cellbit…).

## 4. Ajustes no painel do Supabase
- Authentication > Providers > Email: deixe **Confirm email** e **Secure password change** desligados
  (os e-mails das contas são internos; com eles ligados, cadastro e troca de senha travam).

## 5. config.js
- `EMAIL_BASE`: um Gmail seu (ex.: `movimento.enzola@gmail.com`). Contas novas usam `seuemail+usuario@gmail.com`
  em vez do Gmail de desconhecidos. Contas antigas continuam entrando.

## 6. Depois de publicar
- Troque `og:image` e `og:url` no `index.html` pelo endereço completo do site (para a prévia no WhatsApp).
- Se alguém perder a senha e não tiver o código: Supabase > Authentication > Users > usuário > "Reset password"
  ou "Update user" para definir uma senha nova.
