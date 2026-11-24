# Relatório de testes — Jogos Enzola 3.5

Ambiente: Chrome automatizado (Playwright), no computador (1280 px) e no celular (Pixel 7 e 360 px), com um Supabase
simulado que usa o **supabase-js 2.45.4 de verdade** (login, tabelas e Realtime com presença/broadcast pelo protocolo
Phoenix). As funções novas do banco (carteira, corrida, trocas, metas de grupo) rodam num **PostgreSQL 16 de verdade**
com o `migracao.sql` inteiro. Chamadas WebRTC reais entre duas abas, com microfone e câmera falsos.

Resumo: **todas as verificações passaram**. Erros no console: 0.

## Banco (`migracao.sql` no PostgreSQL 16)
| Verificação | Resultado |
|---|---|
| Arquivo inteiro roda numa transação só | ✅ |
| Rodar 3 vezes seguidas sem erro (antes falhava nas regras do feed) | ✅ |
| Importa moedas, skins, fotos e baús do perfil para a carteira (ignora valores inválidos, renomeia "oculos" → "pirata") | ✅ |
| Rodar de novo não duplica nem apaga saldo | ✅ |
| Conta nova ganha o baú de boas-vindas uma vez | ✅ |
| Moedas por jogo: limite por jogada (999 → 50) e por dia (50 + 30 + 0) | ✅ |
| Origem de moedas inventada é recusada | ✅ |
| Mesma referência não paga duas vezes | ✅ |
| Baús ganhos jogando: limite por dia; baú lendário não pode ser "ganho" | ✅ |
| 2 baús grátis por dia; o 3º é recusado | ✅ |
| Comprar skin: desconta; repetida, sem saldo ou de conquista é recusada | ✅ |
| Abrir baú: sorteio no servidor; 1.000 baús comuns ≈ 40% foto / 59% moedas / 1% skin (skins acabaram no teste) | ✅ |
| Baú lendário sempre tem 5 prêmios e skin na 1ª posição enquanto houver skin a ganhar | ✅ |
| Skin Colecionador só com o álbum completo | ✅ |
| Corrida: 4.000 apostas — vitórias 19,6% × chance anunciada 20,1% | ✅ |
| Corrida: mesma rodada não aceita 2 apostas; aposta fora de 5–100 e corredor inválido recusados | ✅ |
| Presente: foto só se for repetida; sai de quem envia e chega a quem aceita; não paga duas vezes | ✅ |
| Troca recusada devolve o item | ✅ |
| Aceitar troca sem a foto pedida repetida é recusado | ✅ |
| Como "authenticated": vê só a própria carteira, não consegue alterar nem inserir saldo | ✅ |
| Funções internas e `transfer_respond` direto ficam bloqueadas para o site | ✅ |
| Avatar/banner com skin que a pessoa não tem é recusado | ✅ |
| Meta de grupo credita as moedas e a skin Free Fire uma vez só | ✅ |

## Carteira no site (site real + Postgres real)
| Verificação | Resultado |
|---|---|
| Saldo e baú de boas-vindas vêm do servidor | ✅ |
| Comprar skin desconta no servidor e equipa | ✅ |
| Saldo editado no navegador (99.999) não compra nada; a tela volta ao saldo real | ✅ |
| Configurações do perfil não guardam mais moedas | ✅ |
| Ganhar 1.000 na Cobra: o servidor limita a 50 | ✅ |
| Baús grátis e abrir baú: sorteio do servidor aparece na animação; álbum da tela = álbum do servidor | ✅ |
| Corrida: corredores e vencedor do servidor; vencedor da tela = vencedor do banco; saldo certo | ✅ |
| Presente de foto entre duas contas | ✅ |
| Dois aparelhos: XP dos dois soma, lições dos dois ficam marcadas, o aparelho 1 vê o progresso do 2 ao voltar | ✅ |

## Salas (2 pessoas em chamada real, computador e celular)
| Verificação | Resultado |
|---|---|
| WebRTC conecta | ✅ |
| Mudo/desmudo aparece certo para si e para o outro (inclusive com a presença atrasada) | ✅ |
| Microfone depois de "ensurdecer" volta a ouvir e falar (antes ficava mudo) | ✅ |
| Mudo/desmudo rápido termina no estado certo | ✅ |
| Transmitir tela, parar, transmitir de novo (sem vídeo antigo) e voltar à sala com o vídeo tocando | ✅ |
| Câmera: liga, aparece para o outro, desliga; no celular, virar câmera | ✅ |
| Celular: botão Tela explica a limitação e oferece a câmera | ✅ |
| Celular: nenhum controle da chamada fica coberto (barra de instalação/música escondidas na aba) | ✅ |
| Queda do servidor de tempo real: a pessoa volta a aparecer e a chamada continua | ✅ |
| Mesma conta em outro aparelho: aviso, troca automática e o novo fica conectado | ✅ |
| Sair: tela volta na hora, o outro deixa de ver, microfone liberado | ✅ |
| Sair pelo atalho flutuante em outra aba | ✅ |
| Chat de texto: envia, chega em tempo real, sem duplicar, HTML escapado, troca de grupo | ✅ |

## Minigames
| Verificação | Resultado |
|---|---|
| Show do Enzolão: errar mostra a tela de derrota (antes travava) | ✅ |
| Show do Enzolão: 192 perguntas gerais, sem duplicadas; 40 shows seguidos sem repetir nenhuma | ✅ |
| Enzolingo: 14 unidades, 301 frases, 168 palavras, sem itens quebrados | ✅ |
| Enzolingo: ~30 mil perguntas geradas nos dois idiomas, todas válidas (resposta entre as opções, blocos completos) | ✅ |
| Enzolingo: dificuldade sobe — múltipla escolha 50% → 18%, digitação/ditado 10% → 64%, 3 → 4 alternativas, 2 → 5 blocos-armadilha | ✅ |
| Enzolingo: traduções alternativas aceitas ("I'm fine" / "im fine") | ✅ |
| Cadê o Enzola: cenários não repetem em fases seguidas e passam pelos 6 antes de repetir | ✅ |

## Navegação geral (computador e celular)
| Verificação | Resultado |
|---|---|
| 16 rotas + Álbum + 5 jogos do arcade abrem sem erro | ✅ |
| Sem rolagem lateral em nenhuma tela | ✅ |
| Nenhum arquivo do site faltando (404) | ✅ |
| 7 abas cabem no celular (412 px e 360 px), com "Tier" e "Jogar" | ✅ |
| Com a barra "Instale o app", o fim da página fica visível acima dela | ✅ |
| Análise estática de todos os scripts: nenhuma variável indefinida | ✅ |

## O que não dá para testar aqui
- Safari do iPhone e Android de verdade (os testes usam o Chrome).
- O Supabase real do projeto: as tabelas que não estão no repositório foram imitadas pelo formato usado no site.
