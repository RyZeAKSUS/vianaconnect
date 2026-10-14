# VianaConnect

Hackathon UNIPVC x Untile: "Como pode a tecnologia ajudar a criar raizes em Viana do Castelo?"

Uma pessoa que pondera mudar-se para Viana preenche um formulario curto. A app calcula o quanto Viana encaixa no seu perfil, mostra como seria a sua semana tipo, responde aos seus receios e prende-a com Sementes e uma arvore que cresce, levando-a a um contacto real com alguem de Viana.

## Como correr
O `fetch` dos ficheiros JSON nao funciona ao abrir o `index.html` diretamente do disco. Usem um servidor local:

```
python -m http.server 8000
```

e abram http://localhost:8000 (ou a extensao Live Server do VS Code).

## Estrutura
- `index.html`: os 3 ecras (formulario, resultado, progresso)
- `css/style.css`: cores e componentes
- `js/state.js`: estado e localStorage
- `js/afinidade.js`: motor de pontuacao 0-100
- `js/pontos.js`: Sementes, niveis e desbloqueios
- `js/render.js`: desenho dos ecras
- `js/app.js`: arranque e navegacao
- `data/`: catalogo, travoes e niveis em JSON
- `docs/`: notas de AI e pitch

## Branches
`main` esta sempre a funcionar. Uma branch por pessoa: `feat/formulario`, `feat/resultado`, `feat/pontos`, `feat/dados`. Fazer `git pull --rebase` antes de cada push.

## Feito
- [x] Esqueleto com os 3 ecras e navegacao
- [x] Estado em localStorage
- [x] Motor de afinidade base
- [x] Catalogo, travoes e niveis de exemplo

## Falta fazer
- [ ] Formulario em 3 passos
- [ ] Catalogo completo (30-40 itens, 6 categorias)
- [ ] Ecra de resultado: indice, semana tipo, top 5, travoes
- [ ] Pontos, niveis, desbloqueios e arvore (SVG)
- [ ] Responsivo (telemovel primeiro)
- [ ] Deploy final no GitHub Pages
- [ ] Notas de AI preenchidas
- [ ] Pitch ensaiado

## Prazos
Hard stop as 16:45 com commit final. Pitches as 17:00.
