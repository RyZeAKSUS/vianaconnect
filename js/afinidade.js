function calcularAfinidade(perfil, item) {
  const interesses = perfil.interesses || {};
  let total = 0;
  let maximo = 0;

  for (const [etiqueta, peso] of Object.entries(item.etiquetas)) {
    maximo += peso * 5;   // melhor caso: interesse 5
    total += peso * (interesses[etiqueta] || 0);
  }

  return maximo ? Math.round((100 * total) / maximo) : 0;
}

function melhoresMotivos(perfil, item) {
  const interesses = perfil.interesses || {};
  return Object.entries(item.etiquetas || {})
    .map(([etiqueta, peso]) => [etiqueta, peso * (interesses[etiqueta] || 0)])
    .filter(([, contributo]) => contributo > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([etiqueta]) => etiqueta);
}

function rankear(perfil, catalogo) {
  return (catalogo || [])
    .filter((item) => item && item.etiquetas)
    .map((item) => ({
      item,
      score: calcularAfinidade(perfil || {}, item),
      motivos: melhoresMotivos(perfil || {}, item),
    }))
    .sort((a, b) => b.score - a.score);
}

// Indice 0-100: media dos melhores itens e nao de todos, porque ninguem
const ITENS_NO_INDICE = 5;

function calcularIndice(perfil, catalogo) {
  const melhores = rankear(perfil, catalogo).slice(0, ITENS_NO_INDICE);
  if (!melhores.length) return 0;
  const soma = melhores.reduce((acc, r) => acc + r.score, 0);
  return Math.round(soma / melhores.length);
}

// Como cada etiqueta soa dentro da frase "valorizas ..."
const NOME_ETIQUETA = {
  mar: "o mar",
  natureza: "a natureza",
  desporto: "o desporto",
  cultura: "a cultura",
  tradicao: "a tradição",
  gastronomia: "a gastronomia",
  social: "a vida em comunidade",
  tranquilidade: "a tranquilidade",
};

// Frase "porque combina contigo" a partir dos motivos; sem motivos fica neutra
// em vez de inventar uma razao que o perfil nao sustenta.
function explicarMatch(perfil, item) {
  const nomes = melhoresMotivos(perfil || {}, item || {}).map((m) => NOME_ETIQUETA[m] || m);
  if (!nomes.length) return "Pode alargar o teu dia a dia com algo diferente.";
  return "Combina contigo porque valorizas " + nomes.join(" e ") + ".";
}
