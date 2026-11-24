# Jogos Enzola 3.5 — como publicar

Faça na ordem. **O passo 1 vem antes do 2**: o banco precisa estar pronto quando o site novo entrar no ar
(ele importa as Enzola Coins, skins, fotos e baús de cada um para a carteira no servidor).

## 1. Banco (obrigatório)
Supabase > SQL Editor > New query > cole o `migracao.sql` inteiro > Run.
Pode rodar de novo quantas vezes quiser: nada é apagado nem duplicado (o arquivo inteiro roda como uma coisa só;
se der erro, nada é aplicado pela metade).

Se aparecer erro em `pg_net`: Database > Extensions > procure **pg_net** > Enable, e rode o SQL de novo.

O que ele mantém/cria (resumo):
- jogos, perfil público, ID de 4 dígitos, notificações, mensagens, notificações no celular, feed e stories;
- **Salas**: tabela `group_messages` e as regras do canal privado das chamadas (`realtime.messages`);
- **Carteira no servidor** (`wallets`): Enzola Coins, skins, fotos do álbum e baús. Só as funções do banco mexem
  no saldo, com limite por jogada e por dia (`earn_rules`, `chest_rules`). Preços e chances ficam em
  `shop_skins`, `shop_chests` e `album_photos`. Baús são abertos e a Corrida é sorteada no servidor;
- trocas e presentes passam a mover os itens pelo servidor (`wallet_xf_reserve`, `wallet_xf_respond`, `wallet_xf_settle`).

Para mudar um preço ou limite depois: edite a linha na tabela (Table Editor) — o site lê do banco.

## 2. Arquivos (GitHub)
Suba todos os arquivos do repositório. A Vercel publica sozinha.
Novos nesta versão: `lingo-banco.js` (frases do Enzolingo) e `show-banco.js` (perguntas gerais do Show do Enzolão).

## 3. Função do servidor (publique de novo — ela mudou)
Supabase > Edge Functions > **enzola** > Code > cole o `supabase/functions/enzola/index.ts` > Deploy.
(Se ainda não existir: Deploy a new function > nome **enzola**.)

Ela faz: busca na Steam, sinopses e preços, vídeos, notificações no celular, recuperação de senha com código,
excluir conta (agora apaga também as fotos enviadas), painel do administrador e o **TURN das chamadas** (seção 9).

Segredos opcionais (Edge Functions > Secrets): `ITAD_KEY` (preços em reais), `YOUTUBE_KEY` (vídeos), `YOUTUBE_CHANNELS`,
`CF_TURN_KEY_ID` + `CF_TURN_API_TOKEN` (chamadas, seção 9).

## 4. Conta: usuário, senha e código de recuperação
- Entrar e criar conta usam **usuário e senha**.
- Em Configurações > Conta e segurança cada um gera um **código de recuperação**. Com ele, "Esqueci minha senha"
  troca a senha sem e-mail (a função confere o código; 5 tentativas erradas bloqueiam por 15 minutos).

## 5. Notificações no celular — o que cada um precisa fazer
- **Android e computador**: Configurações > Notificações > "Notificações no celular" (ou o convite no sininho) > permitir.
- **iPhone (iOS 16.4 ou mais novo)**: primeiro instalar o app (Safari > Compartilhar > Adicionar à Tela de Início),
  abrir pelo ícone e ativar por lá. A Apple não deixa sites mandarem notificação fora do app instalado.
- Ao sair da conta, o aparelho para de receber as notificações dela.

## 6. Tela de abertura, carregamento e música
- **Abertura**: o hipopótamo com o elenco, balões e fogos, com o áudio `musica/entrada.mp3`. Os navegadores só
  liberam som depois do primeiro toque ("Toque para ouvir"). Quem abre pelo toque numa notificação vai direto.
- **Carregamento**: o filhote nadando na nossa direção, com a linha d'água no queixo (água translúcida na frente do
  corpo), ondulações, rastro e bolhas. Respeita "Reduzir animações".
- **Playlist**: músicas em `musica/`, em ordem aleatória. Para incluir: coloque o MP3 em `musica/` e acrescente o nome
  na lista `PLAYLIST` do `extras.js`. Religar ou mudar o volume: Configurações > Aparência > Música de fundo.

## 7. Patrocinadores
As logos ficam em `patrocinadores/` (PNG sem fundo, em uma cor só; o site pinta na cor do tema).
Para incluir outro, adicione um item na lista `.sp-list` do `index.html`, mantendo a ordem alfabética.

## 8. Minigames
- **Enzolingo**: 14 unidades (A1 → B2) com 4 lições cada, em inglês e espanhol — 301 frases e 168 palavras.
  A dificuldade sobe aos poucos: no começo, mais escolha e montar frase com poucos blocos; depois, 4 alternativas
  parecidas, blocos "quase iguais" (was/were, es/está…), mais digitação e ditado. Cada lição revisa frases das
  unidades anteriores e prioriza as que você viu menos. Para incluir frases: `lingo-banco.js` (use `|` para aceitar
  mais de uma tradução certa; a primeira é a que aparece). Não mude a ordem das unidades: o progresso usa a posição.
- **Show do Enzolão**: mesma divisão de temas (5 dos seus jogos, 3 gerais, 3 inglês, 2 espanhol, 3 hipopótamos,
  2 Movimento Enzola, 2 finais). 192 perguntas gerais em `show-banco.js`, e o show escolhe primeiro as que você
  não vê há mais tempo.
- **Cadê o Enzola**: os cenários passam pelos 6 temas antes de repetir.
- **Corrida**: corredores e vencedor sorteados no servidor; o prêmio já está garantido quando a largada acontece.

## 9. Salas (chat e chamadas por grupo)
1. **Banco**: já vem no `migracao.sql`. No Supabase, em Realtime > Settings, deixe desligado "Allow public access".
2. **TURN (recomendado)**: sem ele, chamadas entre pessoas no 4G ou em redes com firewall podem não conectar.
   - Cloudflare: painel da Cloudflare > Realtime > TURN Server > Create. Copie o *Token ID* e o *API Token* e crie os
     segredos `CF_TURN_KEY_ID` e `CF_TURN_API_TOKEN` na função.
   - Ou outro provedor com usuário e senha fixos: segredos `TURN_URLS` (separadas por vírgula), `TURN_USERNAME` e `TURN_CREDENTIAL`.
   Nenhuma chave fica no GitHub: o site pede as credenciais à função na hora de entrar na sala.
3. **Celular**: os navegadores do Android e do iPhone não deixam sites transmitirem a tela (limitação do sistema).
   No celular o botão "Tela" explica isso e oferece a **câmera** (frontal ou traseira).
4. Entrar numa sala em outro aparelho encerra a chamada no aparelho anterior (igual ao Discord).

## 10. Mais de um aparelho
O progresso (XP, lições, recordes, configurações) é mesclado: o que cada aparelho fez desde a última sincronização
é somado, em vez de um sobrescrever o outro. Ao voltar para o site, ele busca o que o outro aparelho fez.
Moedas, skins, fotos e baús ficam só no servidor, então são sempre os mesmos em todos os aparelhos.

## 11. Abas
Lista de desejos e Resumo ficam dentro do Catálogo (sub-abas no topo). Os links antigos (`#desejos`, `#resumo`)
continuam funcionando. No celular, "Tier List" e "Minigames" aparecem como "Tier" e "Jogar" para caberem as 7 abas.

## 12. Se a busca disser que a chave da RAWG foi recusada
A chave grátis da RAWG tem limite mensal. Crie outra em https://rawg.io/apidocs e troque `RAWG_KEY` no `config.js`.
Com a função publicada, a busca continua achando jogos pela Steam mesmo com a RAWG fora.
