// Sistema de pontos: Sementes e niveis da arvore

// Quanto vale cada acao
const SEMENTES = {
  formulario: 100,
  afinacao: 20,
  guardar: 10,
  experimentar: 15,
  travao: 5,
  primeiroPasso: 50,
  streak: 10
};

function ganharSementes(acao) {
  estado.sementes += SEMENTES[acao] || 0;
  guardarEstado(estado);
  atualizarSementes();
}

// Devolve o nivel mais alto cujo minimo ja foi atingido (niveis ordenados por minimo)
function nivelAtual(sementes, niveis) {
  return niveis.filter((n) => sementes >= n.minimo).pop();
}

// TODO: carregar data/niveis.json e desbloquear funcionalidades por nivel
