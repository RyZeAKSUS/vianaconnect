# VianaConnect

## Contexto
- Hackathon UNIPVC x Untile, 14/10/2026. Tema: "Como pode a tecnologia ajudar a criar raizes em Viana do Castelo?"
- NAO e uma app de turismo. E para quem decide viver em Viana a longo prazo. Evitar tom de guia turistico: falar de rotina, pessoas e receios, nao de "sitios a visitar".
- Entregavel: prototipo funcional (deploy) + pitch + notas sobre o uso de AI. Sem slides.
- Criterios do juri: ideia/impacto, execucao tecnica (UX/UI), uso da AI no processo, originalidade e pitch.
- Nao sao precisos: backend, base de dados, autenticacao, dados reais, produto completo. Dados falsos mas credíveis.
- Prazos: hard stop as 16:45 (commit final), pitches as 17:00. Integracoes as 14:00 e 15:30.

## A ideia
Uma pessoa que pondera mudar-se para Viana (ex.: vive em Franca) preenche um formulario curto em 3 passos (quem es, o que valorizas, o que te trava). A app calcula o quanto Viana encaixa no perfil (Indice 0-100), mostra a semana tipo, os itens que mais combinam e responde aos receios. Sementes (pontos) e uma arvore que cresce prendem o utilizador e desbloqueiam funcionalidades.

## Stack e regras tecnicas
- HTML, CSS e JavaScript puro. Sem frameworks, sem build, sem dependencias.
- Scripts globais carregados pela ordem do index.html (nao usar modulos ES). Cada ficheiro usa funcoes dos anteriores.
- Estado em localStorage via `estado` (js/state.js). Dados em data/*.json carregados com fetch (so funciona com servidor: `python -m http.server 8000`).
- Comentarios curtos, em portugues, a explicar o PORQUE da decisao. Nada de comentarios longos.
- Em ficheiros gerados usar hifen normal "-", nunca o travessao.
- Texto da interface em portugues correto, com acentos. Mobile first.

## Papeis e ficheiros (cada um so mexe nos seus)
- A, formulario e estado: js/render-formulario.js, js/state.js, js/app.js, secao `ecra-formulario`
- B, motor e resultado: js/afinidade.js, js/render-resultado.js, secao `ecra-resultado`
- C, pontos e arvore: js/pontos.js, js/render-progresso.js, secao `ecra-progresso`
- D, conteudo, visual e pitch: data/*.json, css/style.css, docs/, README.md
- No index.html cada um edita apenas a sua `<section>`. Precisar de algo de outro papel: pedir ao dono, nao editar.

## Contratos entre papeis (nao mudar sem avisar)
Perfil (`estado.perfil`, escrito por A, lido por B):
```json
{ "pais": "Franca", "ligacao": "familia", "situacao": "remoto",
  "interesses": { "mar": 5, "natureza": 4, "desporto": 3, "cultura": 2,
                  "tradicao": 2, "gastronomia": 4, "social": 3, "tranquilidade": 4 },
  "hobbies": ["surf", "fotografia"], "travoes": ["conhecer-ninguem", "casa"] }
```
- Etiquetas permitidas (formulario e catalogo): mar, natureza, desporto, cultura, tradicao, gastronomia, social, tranquilidade. Interesses de 0 a 5.
- Categorias do catalogo: natureza, desporto, cultura, gastronomia, comunidade, vida-pratica.
- Item do catalogo (data/catalogo.json): id, categoria, titulo, descricao, etiquetas (pesos 1 a 3), porqueRelacoes.
- Travoes (data/travoes.json): id, medo, resposta.
- Semana tipo (data/semana-tipo.json, escrito por D): lista de slots `{ "dia": "segunda", "momento": "manha", "categoria": "desporto" }`. B escolhe para cada slot o item da categoria com melhor afinidade, sem repetir.
- Pontos (C expoe, B chama): `ganharSementes(acao)` com acoes: formulario, afinacao, guardar, experimentar, travao, primeiroPasso, streak. B deve proteger a chamada com `typeof ganharSementes === "function"`.
- Fluxo: A guarda o perfil, chama `mostrarEcra("ecra-resultado")` e `desenharResultado()`.

## Papel B (quem trabalha no resultado)
Entregar por esta ordem, cada passo a funcionar antes do seguinte:
1. `rankear(perfil, catalogo)` em afinidade.js: devolve `[{ item, score, motivos }]` ordenado, com `motivos` = 2 etiquetas que mais contribuiram.
2. `calcularIndice(perfil, catalogo)`: indice 0-100 (media dos melhores itens, nao de todos, para nao ser sempre baixo).
3. `explicarMatch(perfil, item)`: frase "porque combina contigo" a partir dos motivos.
4. `desenharResultado()`: indice com frase, top 5 com "porque combina contigo" e "porque cria relacoes duradouras", travoes escolhidos com resposta, semana tipo.
5. Botoes guardar e "quero experimentar" que chamam `ganharSementes`.
- Enquanto o formulario (A) nao existir, usar um `PERFIL_EXEMPLO` por defeito no topo de render-resultado.js se `estado.perfil` for null.
- Codigo tolerante: o catalogo pode ter 3 ou 40 itens, e categorias sem itens nao podem partir a pagina.

## Manutencao
- README.md tem as listas "Feito" e "Falta fazer". Atualizar quando se conclui algo (D e dono do ficheiro; pedir ou sugerir a alteracao).
- Registar o uso de AI em docs/notas-ai-B.md (hora, para que serviu, prompt, o que correu mal). O D junta tudo no fim.
- Commits pequenos e frequentes. Nunca `git push --force`.
