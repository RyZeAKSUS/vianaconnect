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
