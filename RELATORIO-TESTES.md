# Relatório de testes — Jogos Enzola 3.0

**168/168 verificações passaram** (rodada completa executada duas vezes seguidas, mesmo resultado). Erros no console: 0.

Ambiente: Chrome automatizado (Playwright), no computador e no celular, com Supabase, RAWG, CheapShark, câmbio e a função do servidor simulados. Também: SQL testado em PostgreSQL 16 (regras de segurança e gatilhos) e a função do servidor testada em Node com 25 casos.


## Login, esqueci a senha, código de recuperação

| Verificação | Resultado |
|---|---|
| Logo na tela de login | ✅ |
| Link “Esqueci minha senha” visível | ✅ |
| Link para instalar o app no login | ✅ |
| Conta nova recebe código de recuperação | ✅ |
| Concluir só libera depois de confirmar que guardou | ✅ |
| Baixar o código em arquivo | ✅ |
| Código guardado (só o hash) no banco | ✅ |
| Perfil novo ganhou ID de 4 dígitos | ✅ |
| Esqueci a senha já traz o usuário digitado | ✅ |
| Código é formatado enquanto digita | ✅ |
| Senhas diferentes são recusadas | ✅ |
| Código errado é recusado | ✅ |
| Código certo troca a senha e entra | ✅ |
| Código usado deixa de valer | ✅ |
| Sem a função: explica e indica o Instagram do administrador | ✅ |

## Perfil, banner, menu e foto da galeria

| Verificação | Resultado |
|---|---|
| Banner não cobre mais o nome | ✅ |
| ID de 4 dígitos no perfil | ✅ |
| Logo no cabeçalho | ✅ |
| Copiar ID | ✅ |
| Menu da conta abre | ✅ |
| Menu tem perfil, configurações, tema, instalar e sair | ✅ |
| Esc fecha o menu | ✅ |
| Tema pelo menu | ✅ |
| Foto: abre a galeria de arquivos (aceita qualquer imagem) | ✅ |
| Foto: abre o recorte redondo | ✅ |
| Foto: enviada e salva no perfil | ✅ |
| Banner: recorte no formato do banner | ✅ |
| Banner: cancelar não altera nada | ✅ |
| Editor: banner pela galeria com o editor aberto por baixo | ✅ |
| Editor: banner salvo | ✅ |

## Busca global e página do jogo

| Verificação | Resultado |
|---|---|
| Lupa no topo abre a pesquisa | ✅ |
| Pesquisa mostra jogo da biblioteca e do catálogo geral | ✅ |
| Selecionar abre a página do jogo | ✅ |
| Ficha: lançamento, gênero, desenvolvedora, tamanho | ✅ |
| Ficha: classificação, plataformas, duração, site | ✅ |
| Sinopse em português | ✅ |
| Notas: Metacritic, jogadores e Steam | ✅ |
| Avaliações reais de jogadores (barras) | ✅ |
| Análises escritas em português (Steam) | ✅ |
| Gameplay de youtuber brasileiro e trailer | ✅ |
| Requisitos do PC | ✅ |
| Seletor de plataforma: PC, PlayStation, Xbox e Switch | ✅ |
| PC: menor preço é a Steam Brasil em reais (R$ 19,19) | ✅ |
| Loja suspeita nunca aparece | ✅ |
| Preço em dólar vira real com o dólar entre parênteses | ✅ |
| Selo de loja oficial | ✅ |
| PlayStation: link direto para a PS Store Brasil | ✅ |
| PlayStation: explica que console não libera preço | ✅ |
| Xbox: link direto na loja brasileira | ✅ |
| Switch: busca na eShop Brasil | ✅ |
| Adicionar à lista de desejos com a plataforma escolhida | ✅ |
| Botão muda para “Na sua lista de desejos” | ✅ |
| Mostra que já está na biblioteca (PC) e na lista (PlayStation) | ✅ |
| Amigos que têm o jogo | ✅ |
| Voltar sai da página do jogo | ✅ |
| Atalho / abre a pesquisa | ✅ |
| Esc fecha a pesquisa | ✅ |
| Jogo inexistente mostra aviso amigável | ✅ |

## Lista de desejos, preços confiáveis, busca e PDF

| Verificação | Resultado |
|---|---|
| Preço em reais com o dólar entre parênteses (R$ 93,57 (US$ 17,49)) | ✅ |
| Loja suspeita mais barata é ignorada | ✅ |
| Revenda autorizada identificada (Green Man Gaming) | ✅ |
| Jogo de console mostra link da loja oficial, não preço de PC | ✅ |
| Total da lista em reais | ✅ |
| Busca na lista de desejos | ✅ |
| Busca sem resultado avisa | ✅ |
| Janela de preços: lojas com selo e conversão | ✅ |
| Preço-alvo em reais | ✅ |
| PDF gerado e válido | ✅ |
| PDF tem título, usuário, jogos e preços em reais | ✅ |
| PDF mantém acentos | ✅ |
| PDF tem links clicáveis para comprar | ✅ |
| Já comprei move para o catálogo | ✅ |

## Galeria

| Verificação | Resultado |
|---|---|
| Busca na galeria | ✅ |
| Contadores dos filtros seguem a busca | ✅ |
| Limpar busca volta tudo | ✅ |

## Configurações

| Verificação | Resultado |
|---|---|
| Página de configurações com 7 seções | ✅ |
| Tema claro | ✅ |
| Tema automático salvo | ✅ |
| Reduzir animações | ✅ |
| Privacidade: desligar cutucadas salva na conta | ✅ |
| Plataforma principal | ✅ |
| Sem revendas: Sekiro passa a mostrar a Steam | ✅ |
| Medidor de força da senha | ✅ |
| Trocar senha: senha atual errada | ✅ |
| Trocar senha: confirmação diferente | ✅ |
| Trocar senha: sucesso | ✅ |
| Avisa que ainda não tem código de recuperação | ✅ |
| Gerar código pelas configurações | ✅ |
| Status muda para “código ativo” | ✅ |
| Limpar cache do aparelho | ✅ |

## Amigos: ID, página do amigo, mensagem, cutucar, sugerir, notificações

| Verificação | Resultado |
|---|---|
| Página de amigos mostra seu ID para compartilhar | ✅ |
| Contador de mensagem não lida no amigo | ✅ |
| Buscar amigo pelo #ID | ✅ |
| Buscar por usuario#ID | ✅ |
| Pedido de amizade gera notificação para o outro | ✅ |
| Sino com 1 notificação não lida | ✅ |
| Notificação de sugestão com recado e capa | ✅ |
| Marcar todas como lidas | ✅ |
| “Quero” abre o jogo sugerido para adicionar | ✅ |
| Página do amigo: nome, @usuário, #ID e amigos desde | ✅ |
| Página do amigo: ações (mensagem, cutucar, sugerir, comparar, remover) | ✅ |
| Página do amigo: compatibilidade | ✅ |
| Página do amigo: abas | ✅ |
| Página do amigo: visão geral com jogando agora, favoritos, tier e atividade | ✅ |
| Aba biblioteca | ✅ |
| Busca na biblioteca do amigo | ✅ |
| Aba em comum com notas lado a lado | ✅ |
| Recomendações do amigo (zerou com nota alta e você não tem) | ✅ |
| Aba desejos do amigo (ideias de presente) | ✅ |
| Chat abre com a conversa | ✅ |
| Mensagem marcada como lida ao abrir | ✅ |
| Enviar mensagem | ✅ |
| Mensagem gera notificação para o amigo | ✅ |
| Tempo real: resposta aparece no chat aberto | ✅ |
| Cutucar envia notificação | ✅ |
| Cutucar de novo em menos de 1 minuto é bloqueado | ✅ |
| Sugestão bloqueada se o amigo desligou | ✅ |
| Sugerir jogo da biblioteca com recado | ✅ |
| Tempo real: cutucada recebida avisa e balança o sino | ✅ |
| Tempo real: mensagem com chat fechado vira contador | ✅ |
| Cutucar de volta pela notificação | ✅ |
| Remover amigo pede confirmação e volta para Amigos | ✅ |

## Catálogo, tier list, CSV e resumo (regressão)

| Verificação | Resultado |
|---|---|
| Zerar jogo comemora | ✅ |
| Nome com ficha vira link para a página do jogo | ✅ |
| Adicionar pelo RAWG continua funcionando | ✅ |
| Jogo salvo | ✅ |
| Aviso de jogo repetido na mesma plataforma | ✅ |
| Exportar CSV | ✅ |
| Tier list: lista de jogos ao lado no computador | ✅ |
| Tier list: arrastar | ✅ |
| Tier list: aviso de jogo selecionado | ✅ |
| Tier list: salvar imagem | ✅ |
| Resumo | ✅ |

## Rodapé e público

| Verificação | Resultado |
|---|---|
| Rodapé: @'s levam ao Instagram | ✅ |
| Rodapé: abrem em nova aba | ✅ |
| Sair de todos os aparelhos | ✅ |
| Perfil público mostra o ID | ✅ |

## Excluir conta

| Verificação | Resultado |
|---|---|
| Excluir: exige digitar o usuário | ✅ |
| Excluir: conta e dados apagados | ✅ |

## Instalar o app

| Verificação | Resultado |
|---|---|
| Sem instalação automática: mostra o passo a passo | ✅ |
| Passo a passo do iPhone (Safari) | ✅ |
| Passo a passo do Android | ✅ |
| Com suporte do navegador: abre o instalador nativo | ✅ |
| App se chama Jogos Enzola e usa a logo | ✅ |
| Título do app no iPhone | ✅ |
| Service worker registrado | ✅ |

## Celular

| Verificação | Resultado |
|---|---|
| Barra de abas fixa embaixo no celular | ✅ |
| Abas com ícone e nome | ✅ |
| Celular: sem rolagem lateral em perfil | ✅ |
| Celular: sem rolagem lateral em catalogo | ✅ |
| Celular: sem rolagem lateral em galeria | ✅ |
| Celular: sem rolagem lateral em tier | ✅ |
| Celular: sem rolagem lateral em desejos | ✅ |
| Celular: sem rolagem lateral em amigos | ✅ |
| Celular: sem rolagem lateral em resumo | ✅ |
| Celular: sem rolagem lateral em config | ✅ |
| Celular: sem rolagem lateral em jogo/274755 | ✅ |
| Celular: sem rolagem lateral em amigo/u-lari | ✅ |
| Barra de instalação aparece no celular | ✅ |
| Fechar a barra lembra a escolha | ✅ |
| Painel de notificações cabe na tela do celular | ✅ |
| Chat ocupa a tela no celular | ✅ |

## Banco sem a migração nova

| Verificação | Resultado |
|---|---|
| Aviso para rodar a migracao.sql | ✅ |
| Sino escondido sem a migração | ✅ |
| Amigos funcionam sem a migração (sem mensagens/cutucar) | ✅ |
| Configurações funcionam sem a migração | ✅ |
| Página do jogo sem a função: dados do RAWG e preço do CheapShark | ✅ |
| Sinopse em inglês com opção de traduzir | ✅ |

## Banco de dados (PostgreSQL 16)

- Migração roda duas vezes sem erro
- ID de 4 dígitos único, gerado sozinho e impossível de trocar pelo usuário
- Cutucar só amigos, no máximo 1 por minuto
- Quem desliga cutucadas, sugestões ou mensagens não recebe
- Mensagens não podem ser editadas; só o destinatário marca como lida
- Notificações automáticas de mensagem, pedido e aceite de amizade
- Código de recuperação guardado só como hash; ninguém lê a tabela pelo site
- Visitante sem login abre perfil público, mas não lê tabelas

## Função do servidor (25/25)

- Preços em reais ordenados; sem chave cai para o CheapShark
- Escolhe o jogo certo na Steam (Hades, não Hades II), sinopse em português sem HTML, tamanho extraído
- Prefere gameplay de youtuber brasileiro e guarda em cache
- Recuperação: código errado recusado, mesmo erro para usuário inexistente, código vale uma vez, bloqueio de 15 min após 5 erros
- Excluir conta exige login e apaga todos os dados