# Jogos Enzola v2: como publicar

1. **Banco (obrigatório, uma vez):** Supabase > SQL Editor > New query > cole o `migracao.sql` > Run.
   Sem esse passo o site funciona, mas não salva horas, preços, preço-alvo nem perfil público (aparece um aviso amarelo).
2. **Arquivos:** substitua tudo no seu servidor: `index.html`, `styles.css`, `app.js`, `config.js`, `sw.js`,
   `manifest.webmanifest`, `og-image.png`, a pasta `icons/` e a `logo.png`.
3. **Contas novas sem e-mail de terceiros (recomendado):** no `config.js`, preencha `EMAIL_BASE` com um Gmail seu
   (ex.: `movimento.enzola@gmail.com`). As contas antigas continuam entrando.
4. **Preços em reais (opcional):** crie uma chave grátis no IsThereAnyDeal, publique `supabase/functions/precos`
   como Edge Function, crie o segredo `ITAD_KEY` e coloque `PRICE_FUNCTION: "precos"` no `config.js`.
   Sem isso, a lista mostra o menor preço de PC em dólar (CheapShark), com conversão aproximada.
5. **Compartilhar no WhatsApp:** depois de publicar, troque `og:image` e `og:url` no `index.html`
   pelo endereço completo (ex.: `https://seusite.com/og-image.png`).
6. **Tempo real dos pedidos de amizade:** já é ativado pelo `migracao.sql`.
