
(function () {
  // ==========================================
  // MAPAS DE AFINIDADE
  // ==========================================

  const TAGS = [
    "mar", "natureza", "desporto", "cultura",
    "tradicao", "gastronomia", "social",
    "tranquilidade", "tecnologia", "carreira"
  ];

  const MAPA_GOSTOS = {
    "Tecnologia": ["tecnologia"],
    "Videojogos": ["tecnologia"],
    "Desporto": ["desporto"],
    "Ginásio": ["desporto"],
    "Música": ["cultura"],
    "Cinema": ["cultura"],
    "Leitura": ["cultura", "tranquilidade"],
    "Arte": ["cultura"],
    "Natureza": ["natureza"],
    "Mar e praia": ["mar"],
    "Gastronomia": ["gastronomia"],
    "Tradições e festas": ["tradicao"],
    "Voluntariado": ["social"],
    "Empreendedorismo": ["carreira"]
  };

  const MAPA_PRIORIDADES = {
    "Emprego": ["carreira"],
    "Habitação": [],
    "Segurança": ["tranquilidade"],
    "Transportes": [],
    "Amizades": ["social"],
    "Cultura": ["cultura"],
    "Natureza": ["natureza"],
    "Qualidade de vida": ["tranquilidade"],
    "Educação": ["carreira"]
  };

  const MAPA_ATIVIDADES = {
    "Eventos tecnológicos": ["tecnologia"],
    "Workshops": ["carreira"],
    "Concertos": ["cultura"],
    "Desporto": ["desporto"],
    "Grupos sociais": ["social"],
    "Voluntariado": ["social"],
    "Caminhadas": ["natureza"],
    "Networking": ["carreira"]
  };

  const MAPA_OBSTACULOS = {
    "Falta de emprego": "emprego",
    "Habitação cara": "casa",
    "Poucos amigos": "conhecer-ninguem",
    "Poucas atividades": "poucas-atividades",
    "Transportes": "transportes",
    "Distância da família": "familia",
    "Ainda não conheço a cidade": "cidade-desconhecida",
    "Nada": null
  };

  // ==========================================
  // PAÍSES
  // ==========================================

  const paises = [
    "Afeganistão", "África do Sul", "Albânia", "Alemanha",
    "Andorra", "Angola", "Antígua e Barbuda",
    "Arábia Saudita", "Argélia", "Argentina",
    "Arménia", "Austrália", "Áustria", "Azerbaijão",
    "Bahamas", "Bangladexe", "Barbados", "Barém",
    "Bélgica", "Belize", "Benim", "Bielorrússia",
    "Bolívia", "Bósnia e Herzegovina", "Botsuana",
    "Brasil", "Brunei", "Bulgária", "Burquina Faso",
    "Burundi", "Butão", "Cabo Verde", "Camarões",
    "Camboja", "Canadá", "Catar", "Cazaquistão",
    "Chade", "Chile", "China", "Chipre", "Colômbia",
    "Comores", "Congo", "Coreia do Norte",
    "Coreia do Sul", "Costa do Marfim", "Costa Rica",
    "Croácia", "Cuba", "Dinamarca", "Djibuti",
    "Dominica", "Egito", "El Salvador",
    "Emirados Árabes Unidos", "Equador", "Eritreia",
    "Eslováquia", "Eslovénia", "Espanha",
    "Estados Unidos", "Estónia", "Eswatini",
    "Etiópia", "Fiji", "Filipinas", "Finlândia",
    "França", "Gabão", "Gâmbia", "Gana", "Geórgia",
    "Granada", "Grécia", "Guatemala", "Guiana",
    "Guiné", "Guiné-Bissau", "Guiné Equatorial",
    "Haiti", "Honduras", "Hungria", "Iémen",
    "Ilhas Marshall", "Ilhas Salomão", "Índia",
    "Indonésia", "Irão", "Iraque", "Irlanda",
    "Islândia", "Israel", "Itália", "Jamaica",
    "Japão", "Jordânia", "Kiribati", "Koweit",
    "Laos", "Lesoto", "Letónia", "Líbano",
    "Libéria", "Líbia", "Listenstaine",
    "Lituânia", "Luxemburgo", "Macedónia do Norte",
    "Madagáscar", "Malásia", "Maláui", "Maldivas",
    "Mali", "Malta", "Marrocos", "Maurícia",
    "Mauritânia", "México", "Micronésia",
    "Moçambique", "Moldávia", "Mónaco", "Mongólia",
    "Montenegro", "Myanmar", "Namíbia", "Nauru",
    "Nepal", "Nicarágua", "Níger", "Nigéria",
    "Noruega", "Nova Zelândia", "Omã",
    "Países Baixos", "Palau", "Palestina",
    "Panamá", "Papua-Nova Guiné", "Paquistão",
    "Paraguai", "Peru", "Polónia", "Portugal",
    "Quénia", "Quirguistão", "Reino Unido",
    "República Centro-Africana", "República Checa",
    "República Democrática do Congo",
    "República Dominicana", "Roménia", "Ruanda",
    "Rússia", "Samoa", "Santa Lúcia",
    "São Cristóvão e Neves", "São Marinho",
    "São Tomé e Príncipe",
    "São Vicente e Granadinas", "Seicheles",
    "Senegal", "Serra Leoa", "Sérvia", "Singapura",
    "Síria", "Somália", "Sri Lanka", "Sudão",
    "Sudão do Sul", "Suécia", "Suíça", "Suriname",
    "Tailândia", "Taiwan", "Tajiquistão",
    "Tanzânia", "Timor-Leste", "Togo", "Tonga",
    "Trindade e Tobago", "Tunísia",
    "Turquemenistão", "Turquia", "Tuvalu",
    "Ucrânia", "Uganda", "Uruguai", "Usbequistão",
    "Vanuatu", "Vaticano", "Venezuela",
    "Vietname", "Zâmbia", "Zimbabué"
  ].sort((a, b) => a.localeCompare(b, "pt-PT"));

  // ==========================================
  // PERGUNTAS
  // ==========================================

  const perguntas = [
    [
      {
        id: "nome",
        titulo: "Como te chamas?",
        tipo: "texto",
        obrigatoria: true
      },
      {
        id: "pais",
        titulo: "Onde vives atualmente?",
        tipo: "pais",
        obrigatoria: true
      },
      {
        id: "idade",
        titulo: "Qual é a tua faixa etária?",
        tipo: "unica",
        opcoes: [
          "Menos de 18", "18-24", "25-34",
          "35-44", "45 ou mais"
        ],
        obrigatoria: true
      },
      {
        id: "situacao",
        titulo: "Qual é a tua situação atual?",
        tipo: "unica",
        opcoes: [
          "Estudante", "Trabalhador", "Trabalho remoto",
          "Estudante-trabalhador",
          "À procura de emprego", "Outra"
        ],
        obrigatoria: true
      },
      {
        id: "ligacao",
        titulo: "Qual é a tua ligação a Viana?",
        tipo: "unica",
        opcoes: [
          "Nenhuma ligação",
          "Tenho família ou amigos cá",
          "Já vivi em Viana",
          "Estudo cá",
          "Vivo cá",
          "Acabei de chegar"
        ],
        obrigatoria: true
      }
    ],
    [
      {
        id: "gostos",
        titulo: "Quais são os teus interesses?",
        tipo: "multipla",
        opcoes: Object.keys(MAPA_GOSTOS),
        obrigatoria: true
      },
      {
        id: "prioridades",
        titulo: "O que mais valorizas numa cidade?",
        tipo: "multipla",
        opcoes: Object.keys(MAPA_PRIORIDADES),
        obrigatoria: true
      },
      {
        id: "atividades",
        titulo: "Que atividades gostarias de descobrir?",
        tipo: "multipla",
        opcoes: Object.keys(MAPA_ATIVIDADES),
        obrigatoria: true
      },
      {
        id: "disponibilidade",
        titulo: "Quando tens disponibilidade?",
        tipo: "multipla",
        opcoes: [
          "Dias úteis", "À noite", "Sábados", "Domingos"
        ],
        obrigatoria: false
      }
    ],
    [
      {
        id: "obstaculos",
        titulo: "O que te dificulta criar raízes em Viana?",
        tipo: "multipla",
        opcoes: Object.keys(MAPA_OBSTACULOS),
        obrigatoria: true
      },
      {
        id: "objetivo",
        titulo: "O que mais gostarias de conseguir?",
        tipo: "unica",
        opcoes: [
          "Encontrar emprego",
          "Fazer amizades",
          "Conhecer atividades",
          "Encontrar uma comunidade",
          "Melhorar a qualidade de vida"
        ],
        obrigatoria: true
      },
      {
        id: "ficar",
        titulo: "Pensarias em ficar a viver em Viana?",
        tipo: "unica",
        opcoes: ["Sim", "Talvez", "Não", "Ainda não sei"],
        obrigatoria: true
      },
      {
        id: "grupos",
        titulo: "Queres receber sugestões de grupos com interesses semelhantes?",
        tipo: "unica",
        opcoes: ["Sim", "Não"],
        obrigatoria: true
      }
    ]
  ];

  const titulos = [
    "Quem és?",
    "O que valorizas?",
    "O que te trava?"
  ];

  // ==========================================
  // PERFIL E AFINIDADES
  // ==========================================

  function pontuar(escolhidas, mapa, pontos, soma) {
    (escolhidas || []).forEach((op) => {
      (mapa[op] || []).forEach((tag) => {
        soma[tag] = (soma[tag] || 0) + pontos;
      });
    });
  }

  function derivarPerfil(r) {
    const soma = {};

    pontuar(r.gostos, MAPA_GOSTOS, 3, soma);
    pontuar(r.prioridades, MAPA_PRIORIDADES, 2, soma);
    pontuar(r.atividades, MAPA_ATIVIDADES, 2, soma);

    const interesses = {};

    TAGS.forEach((t) => {
      interesses[t] = Math.min(5, soma[t] || 0);
    });

    const travoes = (r.obstaculos || [])
      .map((o) => MAPA_OBSTACULOS[o])
      .filter(Boolean);

    return {
      ...r,
      interesses,
      hobbies: r.gostos || [],
      travoes
    };
  }

  function premio() {
    return (
      (typeof SEMENTES !== "undefined" &&
        SEMENTES.formulario) || 100
    );
  }

  function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  // ==========================================
  // VALIDAÇÃO DO NOME
  // ==========================================

  function limparNome(nome) {
    return String(nome).replace(/[^\p{L} '\u2019-]/gu, "");
  }

  function nomeValido(nome) {
    const valor = String(nome).trim();

    return (
      valor.length >= 2 &&
      valor.length <= 80 &&
      /^\p{L}+(?:[ '\u2019-]\p{L}+)*$/u.test(valor)
    );
  }

  // ==========================================
  // PESQUISA DE PAÍSES
  // ==========================================

  function normalizar(texto) {
    return String(texto)
      .trim()
      .toLocaleLowerCase("pt-PT")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function procurarPaises(texto) {
    const pesquisa = normalizar(texto);

    if (!pesquisa) return [];

    return paises
      .filter((pais) => normalizar(pais).includes(pesquisa))
      .sort((a, b) => {
        const aComeca = normalizar(a).startsWith(pesquisa);
        const bComeca = normalizar(b).startsWith(pesquisa);

        if (aComeca !== bComeca) {
          return aComeca ? -1 : 1;
        }

        return a.localeCompare(b, "pt-PT");
      })
      .slice(0, 8);
  }

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  function iniciarFormulario(seletor) {
    const raiz = document.querySelector(
      seletor || "#formulario"
    );

    if (!raiz) {
      console.error("Elemento do formulário não encontrado.");
      return;
    }

    let passo = 0;
    const respostas = { ...(estado.perfil || {}) };

    // ========================================
    // HTML DAS PERGUNTAS
    // ========================================

    function perguntaHTML(p) {
      const atual = respostas[p.id];
      let conteudo = "";

      if (p.tipo === "texto") {
        conteudo = `
          <input
            class="vc-input"
            data-campo="${p.id}"
            type="text"
            maxlength="80"
            value="${escapar(atual || "")}"
            placeholder="Escreve aqui"
            autocomplete="name"
          />
        `;

      } else if (p.tipo === "pais") {
        conteudo = `
          <div class="vc-pais-container">
            <input
              class="vc-input vc-pais-input"
              data-campo="pais"
              id="vc-pais"
              type="text"
              value="${escapar(atual || "")}"
              placeholder="Escreve o nome do país..."
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="false"
              aria-controls="vc-sugestoes-paises"
            />

            <div
              id="vc-sugestoes-paises"
              class="vc-pais-sugestoes"
              role="listbox"
              hidden
            ></div>
          </div>
        `;

      } else {
        const tipo = p.tipo === "multipla"
          ? "checkbox"
          : "radio";

        conteudo = `
          <div class="vc-opcoes">
            ${p.opcoes.map((op) => {
              const selecionado = p.tipo === "multipla"
                ? Array.isArray(atual) && atual.includes(op)
                : atual === op;

              return `
                <label class="vc-opcao">
                  <input
                    type="${tipo}"
                    name="${p.id}"
                    value="${escapar(op)}"
                    ${selecionado ? "checked" : ""}
                  >
                  <span>${escapar(op)}</span>
                </label>
              `;
            }).join("")}
          </div>
        `;
      }

      return `
        <fieldset class="vc-pergunta">
          <legend>
            ${escapar(p.titulo)}
            ${p.obrigatoria
              ? '<span aria-label="obrigatória">*</span>'
              : ""}
          </legend>
          ${conteudo}
        </fieldset>
      `;
    }

    // ========================================
    // VALIDAÇÃO DO NOME AO ESCREVER
    // ========================================

    function ativarValidacaoNome() {
      const input = raiz.querySelector(
        '[data-campo="nome"]'
      );

      if (!input) return;

      input.addEventListener("input", () => {
        const original = input.value;
        const corrigido = limparNome(original);

        if (original !== corrigido) {
          const posicao = input.selectionStart;
          const antes = limparNome(
            original.slice(0, posicao)
          );

          input.value = corrigido;

          input.setSelectionRange(
            antes.length,
            antes.length
          );
        }

        respostas.nome = input.value.trim();
      });
    }

    // ========================================
    // PESQUISA DE PAÍSES
    // ========================================

    function ativarPesquisaPaises() {
      const input = raiz.querySelector("#vc-pais");
      const lista = raiz.querySelector(
        "#vc-sugestoes-paises"
      );

      if (!input || !lista) return;

      let indiceAtivo = -1;
      let resultados = [];

      function fecharSugestoes() {
        lista.hidden = true;
        lista.innerHTML = "";
        input.setAttribute("aria-expanded", "false");
        indiceAtivo = -1;
      }

      function selecionarPais(pais) {
        input.value = pais;
        respostas.pais = pais;
        fecharSugestoes();
        input.focus();
      }

      function atualizarAtivo() {
        const botoes = lista.querySelectorAll(
          ".vc-pais-opcao"
        );

        botoes.forEach((botao, indice) => {
          botao.classList.toggle(
            "vc-pais-ativo",
            indice === indiceAtivo
          );
        });

        if (indiceAtivo >= 0 && botoes[indiceAtivo]) {
          botoes[indiceAtivo].scrollIntoView({
            block: "nearest"
          });
        }
      }

      function mostrarSugestoes() {
        resultados = procurarPaises(input.value);
        indiceAtivo = -1;

        if (!input.value.trim()) {
          fecharSugestoes();
          return;
        }

        if (resultados.length === 0) {
          lista.innerHTML = `
            <div class="vc-pais-vazio">
              Nenhum país encontrado
            </div>
          `;
        } else {
          lista.innerHTML = resultados.map((pais) => `
            <button
              type="button"
              class="vc-pais-opcao"
              role="option"
              data-pais="${escapar(pais)}"
            >
              ${escapar(pais)}
            </button>
          `).join("");
        }

        lista.hidden = false;
        input.setAttribute("aria-expanded", "true");
      }

      input.addEventListener("input", () => {
        respostas.pais = input.value.trim();
        mostrarSugestoes();
      });

      input.addEventListener("focus", () => {
        if (input.value.trim()) mostrarSugestoes();
      });

      input.addEventListener("keydown", (event) => {
        if (lista.hidden) return;

        if (
          event.key === "ArrowDown" &&
          resultados.length > 0
        ) {
          event.preventDefault();

          indiceAtivo = Math.min(
            indiceAtivo + 1,
            resultados.length - 1
          );

          atualizarAtivo();
        }

        if (
          event.key === "ArrowUp" &&
          resultados.length > 0
        ) {
          event.preventDefault();

          indiceAtivo = Math.max(indiceAtivo - 1, 0);
          atualizarAtivo();
        }

        if (
          event.key === "Enter" &&
          indiceAtivo >= 0
        ) {
          event.preventDefault();
          selecionarPais(resultados[indiceAtivo]);
        }

        if (event.key === "Escape") {
          fecharSugestoes();
        }
      });

      lista.addEventListener("click", (event) => {
        const botao = event.target.closest(
          ".vc-pais-opcao"
        );

        if (botao) selecionarPais(botao.dataset.pais);
      });

      input.addEventListener("blur", () => {
        setTimeout(fecharSugestoes, 150);
      });
    }

    // ========================================
    // RECOLHER RESPOSTAS
    // ========================================

    function recolher() {
      perguntas[passo].forEach((p) => {
        if (p.tipo === "texto" || p.tipo === "pais") {
          respostas[p.id] = raiz.querySelector(
            `[data-campo="${p.id}"]`
          ).value.trim();

        } else if (p.tipo === "multipla") {
          respostas[p.id] = [
            ...raiz.querySelectorAll(
              `input[name="${p.id}"]:checked`
            )
          ].map((el) => el.value);

        } else {
          respostas[p.id] = raiz.querySelector(
            `input[name="${p.id}"]:checked`
          )?.value || "";
        }
      });
    }

    // ========================================
    // VALIDAR RESPOSTAS
    // ========================================

    function validar() {
      const erro = raiz.querySelector("#vc-erro");
      erro.textContent = "";

      const falta = perguntas[passo].find((p) => {
        if (!p.obrigatoria) return false;

        const valor = respostas[p.id];

        return Array.isArray(valor)
          ? valor.length === 0
          : !valor;
      });

      if (falta) {
        erro.textContent =
          "Responde à pergunta: " + falta.titulo;
        return false;
      }

      if (passo === 0) {
        if (!nomeValido(respostas.nome || "")) {
          erro.textContent =
            "Introduz um nome válido, sem números ou símbolos.";

          raiz.querySelector(
            '[data-campo="nome"]'
          )?.focus();

          return false;
        }

        const paisEscolhido = paises.find(
          (pais) =>
            normalizar(pais) === normalizar(respostas.pais)
        );

        if (!paisEscolhido) {
          erro.textContent =
            "Seleciona um país válido da lista.";

          raiz.querySelector("#vc-pais")?.focus();
          return false;
        }

        respostas.pais = paisEscolhido;
      }

      return true;
    }

    // ========================================
    // ECRÃ DE RESULTADOS
    // ========================================

    function irParaResultado() {
      mostrarEcra("ecra-resultado");

      if (typeof desenharResultado === "function") {
        desenharResultado();
      }
    }

    // ========================================
    // ECRÃ FINAL
    // ========================================

    function renderFinal(mensagem) {
      raiz.innerHTML = `
        <div class="vc-cartao vc-final">
          <h2>🌱 Perfil concluído!</h2>

          <p>
            Obrigado,
            ${escapar(
              estado.perfil?.nome || respostas.nome || ""
            )}!
            As tuas preferências foram guardadas.
          </p>

          <p><strong>${escapar(mensagem)}</strong></p>

          <p>
            Consulta o teu saldo de Sementes no cabeçalho.
          </p>

          <div class="vc-botoes">
            <button
              type="button"
              id="vc-editar"
              class="vc-secundario"
            >
              Editar respostas
            </button>

            <button type="button" id="vc-ver">
              Ver a minha vida em Viana
            </button>
          </div>
        </div>
      `;

      raiz.querySelector("#vc-editar")
        .addEventListener("click", () => {
          passo = 0;
          render();
        });

      raiz.querySelector("#vc-ver")
        .addEventListener("click", irParaResultado);
    }

    // ========================================
    // RENDERIZAR FORMULÁRIO
    // ========================================

    function render() {
      raiz.innerHTML = `
        <div class="vc-cartao">

          <div class="vc-topo">
            <strong>VianaConnect</strong>
            <span>Passo ${passo + 1} de 3</span>
          </div>

          <div class="vc-barra">
            <div style="width:${((passo + 1) / 3) * 100}%">
            </div>
          </div>

          <h2>${titulos[passo]}</h2>

          <p class="vc-subtitulo">
            Conta-nos um pouco sobre ti para
            descobrires o teu lugar em Viana.
          </p>

          <form id="vc-form" novalidate>
            ${perguntas[passo].map(perguntaHTML).join("")}

            <p
              id="vc-erro"
              class="vc-erro"
              role="alert"
            ></p>

            <div class="vc-botoes">
              ${passo
                ? `<button
                     type="button"
                     id="vc-voltar"
                     class="vc-secundario"
                   >Voltar</button>`
                : "<span></span>"
              }

              <button type="submit">
                ${passo === 2
                  ? "Concluir e ganhar " +
                    premio() + " Sementes"
                  : "Continuar"
                }
              </button>
            </div>
          </form>
        </div>
      `;

      if (passo === 0) {
        ativarValidacaoNome();
        ativarPesquisaPaises();
      }

      raiz.querySelector("#vc-voltar")
        ?.addEventListener("click", () => {
          recolher();
          passo--;
          render();
        });

      raiz.querySelector("#vc-form")
        .addEventListener("submit", (event) => {
          event.preventDefault();
          recolher();

          if (!validar()) return;

          if (passo < 2) {
            passo++;
            render();
            return;
          }

          const primeiraVez = !estado.formularioConcluido;

          // Guarda o perfil através da função existente.
          // A atribuição de Sementes deve ser feita
          // exclusivamente pelo sistema de Pontos.
          concluirFormulario(derivarPerfil(respostas));

          renderFinal(
            primeiraVez
              ? "Perfil concluído! Verifica as tuas Sementes no cabeçalho."
              : "Perfil atualizado!"
          );

          atualizarSementes();

          document.dispatchEvent(
            new CustomEvent(
              "vianaconnect:perfilAtualizado",
              {
                detail: {
                  perfil: estado.perfil,
                  sementes: estado.sementes
                }
              }
            )
          );
        });
    }

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    if (estado.formularioConcluido && estado.perfil) {
      renderFinal("Perfil guardado.");
    } else {
      render();
    }
  }

  window.iniciarFormulario = iniciarFormulario;

})();
