// Motor de afinidade: pontua de 0 a 100 o quanto um item combina com o perfil.
// Usa regras simples e nao AI ao vivo, porque nao ha backend e a pontuacao tem de ser instantanea.
//
// perfil.interesses: {mar: 5, desporto: 3, ...} (escala 0 a 5)
// item.etiquetas:    {mar: 3, desporto: 1, ...} (peso do item em cada tema)
function calcularAfinidade(perfil, item) {
  const interesses = perfil.interesses || {};
  let total = 0;
  let maximo = 0;

  for (const [etiqueta, peso] of Object.entries(item.etiquetas)) {
    maximo += peso * 5;                          // melhor caso: interesse 5
    total += peso * (interesses[etiqueta] || 0);
  }

  return maximo ? Math.round((100 * total) / maximo) : 0;
}

// TODO: gerar o texto "porque combina contigo" com as 2 etiquetas mais fortes
