# Relatório de testes — Jogos Enzola 3.3

**250/250 verificações passaram.** Erros no console: 0.

Ambiente: Chrome automatizado (Playwright), no computador e no celular, com Supabase, RAWG, Steam, CheapShark, câmbio e a função do servidor simulados.
Também: `migracao.sql` rodada duas vezes em PostgreSQL 16, a função do servidor testada em Node (15 casos, incluindo a criptografia das notificações) e uma varredura de layout em 320, 390, 768, 1024 e 1440 px em todas as telas.


## Cadastro com e-mail, login e recuperação de senha

| Verificação | Resultado |
|---|---|
| Logo na tela de login | ✅ |
| Abas Entrar / Criar conta | ✅ |
| Login pede e-mail | ✅ |
| Aba Criar conta mostra e-mail, usuário e senha | ✅ |
| Cadastro: e-mail inválido é recusado | ✅ |
| Cadastro: avisa na hora que o usuário já existe | ✅ |
| Cadastro: usuário vira minúsculo ao digitar | ✅ |
| Cadastro: avisa que o usuário está livre | ✅ |
| Cadastro: e-mail já usado é recusado | ✅ |
| Cadastro usa o e-mail digitado (em minúsculas) | ✅ |
| Cadastro guarda o usuário escolhido | ✅ |
| Entra direto e mostra @usuário | ✅ |
| Perfil criado com o usuário e ID | ✅ |
| Configurações mostram o e-mail atual (sem aviso de conta antiga) | ✅ |
| Login: senha errada | ✅ |
| Login com e-mail e senha | ✅ |
| Esqueci a senha já traz o e-mail digitado | ✅ |
| Esqueci a senha: e-mail inválido | ✅ |
| Esqueci a senha: envia o link | ✅ |
| Link volta para o próprio site | ✅ |
| Mensagem não revela se o e-mail existe | ✅ |
| Abrir o link do e-mail pede a nova senha | ✅ |
| Nova senha: confirmação diferente | ✅ |
| Nova senha salva | ✅ |
| Conta antiga: dica para quem usa usuário | ✅ |
| Conta antiga entra com o usuário | ✅ |
| Conta antiga: aviso para cadastrar e-mail | ✅ |
| Conta antiga: cadastra o e-mail verdadeiro | ✅ |
| Aviso some depois de cadastrar | ✅ |
| Usuário continua o mesmo | ✅ |
| Depois disso entra com o e-mail novo | ✅ |
| Com confirmação: avisa que mandou o link | ✅ |
| Com confirmação: login antes de confirmar explica o motivo | ✅ |
| Reenviar link de confirmação | ✅ |
| Sem servidor de e-mail configurado: mensagem clara | ✅ |

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
| Página de configurações com 8 seções | ✅ |
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

## Pesquisa: botão visível, relevância e Steam

| Verificação | Resultado |
|---|---|
| Botão 'Pesquisar jogos' com texto no topo | ✅ |
| Relevância: Hades antes da trilha sonora e de outros jogos | ✅ |
| Busca não duplica Hades (RAWG + Steam juntos) | ✅ |
| RAWG pedida com busca precisa | ✅ |
| Jogo novo que só está na Steam aparece (Fart Together) | ✅ |
| Página do jogo da Steam abre com sinopse em português | ✅ |
| Adicionar jogo da Steam à lista de desejos guarda steam_id | ✅ |
| RAWG fora do ar: Steam ainda responde (sem erro de conexão) | ✅ |
| Sem resultado: oferece adicionar manualmente | ✅ |
| Chave da RAWG recusada: mensagem explica o motivo (não fala em conexão) | ✅ |
| Limite de pesquisas: pede para esperar | ✅ |
| Sem internet de verdade: avisa que está sem internet | ✅ |

## Resumo rápido ao tocar na capa

| Verificação | Resultado |
|---|---|
| Catálogo: capa abre resumo do jogo | ✅ |
| Resumo traz sinopse em português | ✅ |
| Botão 'Ver página completa' leva à ficha | ✅ |
| Abre a página completa | ✅ |
| Jogo sem ficha: botão vira pesquisa | ✅ |
| Jogos do amigo: capa abre resumo com a nota dele | ✅ |
| Resumo do amigo tem 'Ver página completa' | ✅ |
| Jogo que já está nos meus desejos é avisado | ✅ |
| Jogo que não tenho mostra 'Quero jogar' | ✅ |
| 'Quero jogar' abre o formulário já preenchido | ✅ |

## Notificações no celular

| Verificação | Resultado |
|---|---|
| Painel de notificações convida a receber no celular | ✅ |
| Ativar: pede a chave ao servidor e assina o aparelho | ✅ |
| Aparelho salvo na tabela push_subscriptions | ✅ |
| Convite some depois de ativar | ✅ |
| Configurações mostram notificações ligadas | ✅ |
| Desligar remove o aparelho | ✅ |
| Sair da conta para de mandar notificações para este aparelho | ✅ |
| Service worker mostra a notificação e abre a tela certa ao tocar | ✅ |

## Tela de abertura

| Verificação | Resultado |
|---|---|
| Abertura aparece ao acessar, com hipopótamo e elenco | ✅ |
| Balões e fogos na abertura | ✅ |
| Botão da música fica escondido durante a abertura | ✅ |
| Áudio da abertura toca em looping depois do primeiro toque | ✅ |
| 'Entrar' fecha a abertura, para o áudio dela e começa a playlist | ✅ |
| Depois da abertura aparece a tela de login | ✅ |
| Abertura aparece de novo a cada acesso | ✅ |
| Enter também entra | ✅ |
| Quem abre pela notificação vai direto, sem a abertura | ✅ |
| Convite aparece na abertura | ✅ |

## Música de fundo (playlist)

| Verificação | Resultado |
|---|---|
| Botão da música discreto (pequeno e meio transparente) | ✅ |
| Playlist começa no primeiro toque | ✅ |
| Volume ambiente (nem alto nem baixo) | ✅ |
| Playlist tem as 16 músicas, todas leves | ✅ |
| Próxima música | ✅ |
| Música anterior | ✅ |
| Ao terminar, passa sozinha para a próxima | ✅ |
| Pausar | ✅ |
| Tocar de novo | ✅ |
| 'Desativar música' pede confirmação antes | ✅ |
| Cancelar mantém a música | ✅ |
| Confirmar desliga, tira o botão e avisa onde religar | ✅ |
| Depois de recarregar continua desligada e sem botão | ✅ |
| Religar em Configurações: volta a tocar e o botão reaparece | ✅ |
| Celular: arrastar o botão para baixo pede confirmação | ✅ |

## Patrocinadores

| Verificação | Resultado |
|---|---|
| Quatro patrocinadores em ordem alfabética | ✅ |
| daanzada leva ao Pinterest | ✅ |
| Labum leva ao site da Labum | ✅ |
| Logos sem fundo, na cor do tema | ✅ |

## Imagens na exportação (celular)

| Verificação | Resultado |
|---|---|
| Capa que só libera CORS sem cache entra na imagem | ✅ |
| Capa sem CORS usa o proxy de imagens e entra na imagem | ✅ |
| Tier list no celular sai com as capas | ✅ |
| PDF da lista de desejos no celular sai com as capas | ✅ |
| Celular: botão de pesquisa e de música não ficam escondidos | ✅ |
| Rodapé sem créditos pessoais | ✅ |
