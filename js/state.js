// Estado da app guardado no localStorage (sem backend, como pede o briefing)
const CHAVE = "vianaconnect";

const estadoInicial = {
  perfil: null,      // respostas do formulario
  sementes: 0,       // pontos
  guardados: [],     // ids dos itens guardados na semana tipo
  ultimaVisita: null // para calcular a streak diaria
};

function carregarEstado() {
  // try/catch porque o localStorage pode estar bloqueado (modo privado)
  try {
    return { ...estadoInicial, ...JSON.parse(localStorage.getItem(CHAVE)) };
  } catch (e) {
    return { ...estadoInicial };
  }
}

function guardarEstado(e) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(e));
  } catch (err) {
    // sem storage a app continua a funcionar, so nao persiste
  }
}

let estado = carregarEstado();
