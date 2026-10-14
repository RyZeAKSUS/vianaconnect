// Dentro de uma IIFE para os nomes (TAGS, MAPA_*...) nao colidirem com os de outros ficheiros:
// em scripts globais, dois "const" iguais em ficheiros diferentes partem a pagina.
(function () {
  // Etiquetas do contrato (ver CLAUDE.md). B usa-as para pontuar o catalogo.
  const TAGS = ["mar", "natureza", "desporto", "cultura", "tradicao", "gastronomia", "social", "tranquilidade", "tecnologia", "carreira"];

  // Cada opcao liga-se a etiquetas. As opcoes mostradas vem destas chaves,
  // assim o que se pergunta e o que se pontua nunca ficam desalinhados.
  const MAPA_GOSTOS = {
    "Tecnologia": ["tecnologia"], "Videojogos": ["tecnologia"], "Desporto": ["desporto"], "Ginásio": ["desporto"],
    "Música": ["cultura"], "Cinema": ["cultura"], "Leitura": ["cultura", "tranquilidade"], "Arte": ["cultura"],
    "Natureza": ["natureza"], "Mar e praia": ["mar"], "Gastronomia": ["gastronomia"], "Tradições e festas": ["tradicao"],
    "Voluntariado": ["social"], "Empreendedorismo": ["carreira"]
  };
  const MAPA_PRIORIDADES = {
    "Emprego": ["carreira"], "Habitação": [], "Segurança": ["tranquilidade"], "Transportes": [],
    "Amizades": ["social"], "Cultura": ["cultura"], "Natureza": ["natureza"],
    "Qualidade de vida": ["tranquilidade"], "Educação": ["carreira"]
  };
  const MAPA_ATIVIDADES = {
    "Eventos tecnológicos": ["tecnologia"], "Workshops": ["carreira"], "Concertos": ["cultura"], "Desporto": ["desporto"],
    "Grupos sociais": ["social"], "Voluntariado": ["social"], "Caminhadas": ["natureza"], "Networking": ["carreira"]
  };
  // Obstaculos viram ids de data/travoes.json (o D tem de ter um travao por cada id)
  const MAPA_OBSTACULOS = {
    "Falta de emprego": "emprego", "Habitação cara": "casa", "Poucos amigos": "conhecer-ninguem",
    "Poucas atividades": "poucas-atividades", "Transportes": "transportes", "Distância da família": "familia",
    "Ainda não conheço a cidade": "cidade-desconhecida", "Nada": null
  };

  const perguntas = [
    [
      { id: "nome", titulo: "Como te chamas?", tipo: "texto", obrigatoria: true },
      { id: "pais", titulo: "Onde vives atualmente?", tipo: "unica", opcoes: ["Portugal", "França", "Suíça", "Luxemburgo", "Reino Unido", "Alemanha", "Outro país"], obrigatoria: true },
      { id: "idade", titulo: "Qual é a tua faixa etária?", tipo: "unica", opcoes: ["Menos de 18", "18-24", "25-34", "35-44", "45 ou mais"], obrigatoria: true },
      { id: "situacao", titulo: "Qual é a tua situação atual?", tipo: "unica", opcoes: ["Estudante", "Trabalhador", "Trabalho remoto", "Estudante-trabalhador", "À procura de emprego", "Outra"], obrigatoria: true },
      { id: "ligacao", titulo: "Qual é a tua ligação a Viana?", tipo: "unica", opcoes: ["Nenhuma ligação", "Tenho família ou amigos cá", "Já vivi em Viana", "Estudo cá", "Vivo cá", "Acabei de chegar"], obrigatoria: true }
    ],
    [
      // "gostos" (e nao "interesses") para nao colidir com perfil.interesses, que e o objeto 0-5 do contrato
      { id: "gostos", titulo: "Quais são os teus interesses?", tipo: "multipla", opcoes: Object.keys(MAPA_GOSTOS), obrigatoria: true },
      { id: "prioridades", titulo: "O que mais valorizas numa cidade?", tipo: "multipla", opcoes: Object.keys(MAPA_PRIORIDADES), obrigatoria: true },
      { id: "atividades", titulo: "Que atividades gostarias de descobrir?", tipo: "multipla", opcoes: Object.keys(MAPA_ATIVIDADES), obrigatoria: true },
      { id: "disponibilidade", titulo: "Quando tens disponibilidade?", tipo: "multipla", opcoes: ["Dias úteis", "À noite", "Sábados", "Domingos"], obrigatoria: false }
    ],
    [
      { id: "obstaculos", titulo: "O que te dificulta criar raízes em Viana?", tipo: "multipla", opcoes: Object.keys(MAPA_OBSTACULOS), obrigatoria: true },
      { id: "objetivo", titulo: "O que mais gostarias de conseguir?", tipo: "unica", opcoes: ["Encontrar emprego", "Fazer amizades", "Conhecer atividades", "Encontrar uma comunidade", "Melhorar a qualidade de vida"], obrigatoria: true },
      { id: "ficar", titulo: "Pensarias em ficar a viver em Viana?", tipo: "unica", opcoes: ["Sim", "Talvez", "Não", "Ainda não sei"], obrigatoria: true },
      { id: "grupos", titulo: "Queres receber sugestões de grupos com interesses semelhantes?", tipo: "unica", opcoes: ["Sim", "Não"], obrigatoria: true }
    ]
  ];

  const titulos = ["Quem és?", "O que valorizas?", "O que te trava?"];

  // Soma pontos por etiqueta para cada opcao escolhida
  function pontuar(escolhidas, mapa, pontos, soma) {
    (escolhidas || []).forEach((op) => (mapa[op] || []).forEach((tag) => { soma[tag] = (soma[tag] || 0) + pontos; }));
  }

  // Converte as respostas no perfil do contrato (interesses 0-5, hobbies, travoes).
  // Pesos 3/2/2 com teto 5: dizer que gosta de algo da 3, e confirmar noutra pergunta sobe para 5.
  function derivarPerfil(r) {
    const soma = {};
    pontuar(r.gostos, MAPA_GOSTOS, 3, soma);
    pontuar(r.prioridades, MAPA_PRIORIDADES, 2, soma);
    pontuar(r.atividades, MAPA_ATIVIDADES, 2, soma);
    const interesses = {};
    TAGS.forEach((t) => { interesses[t] = Math.min(5, soma[t] || 0); });
    const travoes = (r.obstaculos || []).map((o) => MAPA_OBSTACULOS[o]).filter(Boolean);
    return { ...r, interesses, hobbies: r.gostos || [], travoes };
  }

  // Valor do premio vem da tabela de C (pontos.js); 100 so se ainda nao existir
  function premio() {
    return (typeof SEMENTES !== "undefined" && SEMENTES.formulario) || 100;
  }

  function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function iniciarFormulario(seletor) {
    const raiz = document.querySelector(seletor || "#formulario");
    if (!raiz) { console.error("Elemento " + seletor + " não encontrado."); return; }
    let passo = 0;
    const respostas = { ...(estado.perfil || {}) };

    function perguntaHTML(p) {
      const atual = respostas[p.id];
      let conteudo = "";
      if (p.tipo === "texto") {
        conteudo = `<input class="vc-input" data-campo="${p.id}" type="text" maxlength="80" value="${escapar(atual || "")}" placeholder="Escreve aqui" />`;
      } else {
        const tipo = p.tipo === "multipla" ? "checkbox" : "radio";
        conteudo = `<div class="vc-opcoes">${p.opcoes.map((op) => {
          const selecionado = p.tipo === "multipla" ? (Array.isArray(atual) && atual.includes(op)) : atual === op;
          return `<label class="vc-opcao"><input type="${tipo}" name="${p.id}" value="${escapar(op)}" ${selecionado ? "checked" : ""}> <span>${escapar(op)}</span></label>`;
        }).join("")}</div>`;
      }
      return `<fieldset class="vc-pergunta"><legend>${escapar(p.titulo)}${p.obrigatoria ? ' <span aria-label="obrigatória">*</span>' : ""}</legend>${conteudo}</fieldset>`;
    }

    // Guarda as respostas do passo atual (antes de avancar, recuar ou validar)
    function recolher() {
      perguntas[passo].forEach((p) => {
        if (p.tipo === "texto") respostas[p.id] = raiz.querySelector(`[data-campo="${p.id}"]`).value.trim();
        else if (p.tipo === "multipla") respostas[p.id] = [...raiz.querySelectorAll(`input[name="${p.id}"]:checked`)].map((el) => el.value);
        else respostas[p.id] = raiz.querySelector(`input[name="${p.id}"]:checked`)?.value || "";
      });
    }

    function validar() {
      const falta = perguntas[passo].find((p) => p.obrigatoria && (Array.isArray(respostas[p.id]) ? respostas[p.id].length === 0 : !respostas[p.id]));
      if (falta) {
        raiz.querySelector("#vc-erro").textContent = "Responde à pergunta: " + falta.titulo;
        return false;
      }
      return true;
    }

    // Do formulario para o ecra de resultado (que e de B). typeof evita erro enquanto B nao tiver feito a funcao
    function irParaResultado() {
      mostrarEcra("ecra-resultado");
      if (typeof desenharResultado === "function") desenharResultado();
    }

    function renderFinal(mensagem) {
      raiz.innerHTML = `<div class="vc-cartao vc-final"><h2>🌱 Perfil concluído!</h2><p>Obrigado, ${escapar(estado.perfil?.nome || respostas.nome || "")}! As tuas preferências foram guardadas.</p><p><strong>${mensagem}</strong></p><p>Saldo: ${estado.sementes} Sementes</p><div class="vc-botoes"><button type="button" id="vc-editar" class="vc-secundario">Editar respostas</button><button type="button" id="vc-ver">Ver a minha vida em Viana</button></div></div>`;
      raiz.querySelector("#vc-editar").addEventListener("click", () => { passo = 0; render(); });
      raiz.querySelector("#vc-ver").addEventListener("click", irParaResultado);
    }

    function render() {
      raiz.innerHTML = `<div class="vc-cartao"><div class="vc-topo"><strong>VianaConnect</strong><span>Passo ${passo + 1} de 3</span></div><div class="vc-barra"><div style="width:${((passo + 1) / 3) * 100}%"></div></div><h2>${titulos[passo]}</h2><p class="vc-subtitulo">Conta-nos um pouco sobre ti para descobrires o teu lugar em Viana.</p><form id="vc-form" novalidate>${perguntas[passo].map(perguntaHTML).join("")}<p id="vc-erro" class="vc-erro" role="alert"></p><div class="vc-botoes">${passo ? '<button type="button" id="vc-voltar" class="vc-secundario">Voltar</button>' : "<span></span>"}<button type="submit">${passo === 2 ? "Concluir e ganhar " + premio() + " Sementes" : "Continuar"}</button></div></form></div>`;
      raiz.querySelector("#vc-voltar")?.addEventListener("click", () => { recolher(); passo--; render(); });
      raiz.querySelector("#vc-form").addEventListener("submit", (event) => {
        event.preventDefault();
        recolher();
        if (!validar()) return;
        if (passo < 2) { passo++; render(); return; }
        const primeiraVez = !estado.formularioConcluido;
        concluirFormulario(derivarPerfil(respostas));
        renderFinal(primeiraVez ? "+" + premio() + " Sementes recebidas!" : "Perfil atualizado!");
        atualizarSementes();
        // Evento para quem quiser reagir ao perfil (ex.: B redesenhar o resultado)
        document.dispatchEvent(new CustomEvent("vianaconnect:perfilAtualizado", { detail: { perfil: estado.perfil, sementes: estado.sementes } }));
      });
    }

    // Quem ja concluiu volta ao resumo (e nao ao passo 1), para a demo ser rapida
    if (estado.formularioConcluido && estado.perfil) renderFinal("Perfil guardado.");
    else render();
  }

  window.iniciarFormulario = iniciarFormulario;
})();
