// Estado da app guardado no localStorage (sem backend, como pede o briefing)
const CHAVE_ESTADO = "vianaconnect_estado_v1";

// Funcao (e nao objeto) para cada leitura receber um array "guardados" novo, sem partilhar referencias
function estadoInicial() {
  return {
    perfil: null,              // respostas do formulario + campos derivados (ver contrato)
    sementes: 0,               // pontos
    formularioConcluido: false,
    guardados: [],             // ids dos itens guardados na semana tipo
    ultimaVisita: null         // para calcular a streak diaria
  };
}

function carregarEstado() {
  // try/catch porque o localStorage pode estar bloqueado ou corrompido
  try {
    return { ...estadoInicial(), ...JSON.parse(localStorage.getItem(CHAVE_ESTADO) || "{}") };
  } catch (e) {
    return estadoInicial();
  }
}

// Aceita (e ignora) um argumento para continuar compativel com chamadas guardarEstado(estado)
function guardarEstado() {
  try {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
  } catch (e) {
    // sem storage a app continua a funcionar, so nao persiste
  }
}

let estado = carregarEstado();

function concluirFormulario(perfil) {
  estado.perfil = { ...perfil };
  if (!estado.formularioConcluido) {
    estado.formularioConcluido = true;
    // O valor dos pontos vive em pontos.js (dono: C), para ter uma unica fonte
    if (typeof ganharSementes === "function") ganharSementes("formulario");
    else estado.sementes += 100;
  }
  guardarEstado();
}
