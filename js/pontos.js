/* pontos.js — Sementes, níveis, desbloqueios e streak diária (papel C)
 *
 * Script normal (sem import/export): expõe window.Pontos.
 * Guarda tudo em localStorage na chave "vianaconnect.progresso", por isso
 * não depende do state.js dos outros. Emite o evento "pontos:mudou" no
 * document sempre que algo muda.
 *
 * API que os outros chamam:
 *   Pontos.adicionar('perfil_completo')          // A, ao concluir o formulário
 *   Pontos.adicionar('ver_resultado')            // B, ao mostrar o resultado
 *   Pontos.adicionar('ler_travao', 'travao-3')   // B, ao abrir uma resposta (ref = id)
 *   Pontos.adicionar('guardar_item', 'item-12')  // B, ao guardar um item do top 5
 *   Pontos.adicionar('pedir_contacto')           // B, no botão "falar com alguém de Viana"
 *   Pontos.registarVisita()                      // app.js, 1x no arranque
 */
(function () {
  'use strict';

  var CHAVE = 'vianaconnect.progresso';

  // Cada ação só dá Sementes uma vez por (ação + ref). Evita fazer farming a clicar.
  var ACOES = {
    perfil_completo: { sementes: 100, texto: 'Perfil concluído' },
    ver_resultado:   { sementes: 20,  texto: 'Viste o teu resultado' },
    ler_travao:      { sementes: 10,  texto: 'Leste uma resposta a um receio' },
    guardar_item:    { sementes: 10,  texto: 'Guardaste uma sugestão' },
    pedir_contacto:  { sementes: 50,  texto: 'Pediste contacto com alguém de Viana' }
  };

  // Valores por defeito. Se data/niveis.json tiver este formato, substitui-os.
  // Formato: [{ "nivel": 1, "nome": "Semente", "sementes": 0, "desbloqueia": "texto" }, ...]
  var NIVEIS_DEFAULT = [
    { nivel: 1, nome: 'Semente', sementes: 0,   desbloqueia: 'Guia dos primeiros 30 dias' },
    { nivel: 2, nome: 'Rebento', sementes: 100, desbloqueia: 'Semana tipo completa' },
    { nivel: 3, nome: 'Arbusto', sementes: 250, desbloqueia: 'Clubes e associações da cidade' },
    { nivel: 4, nome: 'Árvore',  sementes: 450, desbloqueia: 'Contacto com um residente' },
    { nivel: 5, nome: 'Floresta', sementes: 700, desbloqueia: 'Convite para um evento local' }
  ];

  var niveis = NIVEIS_DEFAULT.slice();

  function novoEstado() {
    return { sementes: 0, feitas: {}, historico: [], streak: 0, melhorStreak: 0, ultimoDia: null };
  }

  function ler() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (!bruto) return novoEstado();
      return Object.assign(novoEstado(), JSON.parse(bruto));
    } catch (e) {
      return novoEstado();
    }
  }

  var estado = ler();

  function guardar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* modo privado */ }
  }

  function hojeISO(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia; // data local, não UTC
  }

  function diasEntre(a, b) { // a e b em "YYYY-MM-DD"
    var pa = a.split('-'), pb = b.split('-');
    var da = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
    var db = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }

  function nivelPara(sementes) {
    var atual = niveis[0];
    for (var i = 0; i < niveis.length; i++) {
      if (sementes >= niveis[i].sementes) atual = niveis[i];
    }
    return atual;
  }

  function avisar(detalhe) {
    document.dispatchEvent(new CustomEvent('pontos:mudou', { detail: detalhe }));
  }

  // Dá Sementes e trata de subida de nível. Devolve { ganhou, subiuNivel, nivel }.
  function dar(quantidade, texto) {
    var antes = nivelPara(estado.sementes).nivel;
    estado.sementes += quantidade;
    estado.historico.unshift({ texto: texto, sementes: quantidade, quando: Date.now() });
    estado.historico = estado.historico.slice(0, 20);
    var depois = nivelPara(estado.sementes);
    guardar();
    var res = { ganhou: quantidade, subiuNivel: depois.nivel > antes, nivel: depois };
    avisar(res);
    return res;
  }

  var Pontos = {
    ACOES: ACOES,

    /** Tenta carregar data/niveis.json; se falhar ou vier noutro formato, usa os defaults. */
    init: function (url) {
      return fetch(url || 'data/niveis.json')
        .then(function (r) { return r.json(); })
        .then(function (lista) {
          var ok = Array.isArray(lista) && lista.length > 0 && lista.every(function (n) {
            return typeof n.sementes === 'number' && typeof n.nome === 'string';
          });
          if (ok) {
            niveis = lista.slice().sort(function (a, b) { return a.sementes - b.sementes; })
              .map(function (n, i) {
                return { nivel: n.nivel || i + 1, nome: n.nome, sementes: n.sementes, desbloqueia: n.desbloqueia || '' };
              });
          }
        })
        .catch(function () { /* mantém defaults */ })
        .then(function () { avisar({ ganhou: 0, subiuNivel: false, nivel: nivelPara(estado.sementes) }); });
    },

    /** Dá Sementes por uma ação (uma vez por ação+ref). Devolve null se já tinha sido feita. */
    adicionar: function (acao, ref) {
      var def = ACOES[acao];
      if (!def) { console.warn('[Pontos] ação desconhecida:', acao); return null; }
      var chave = acao + ':' + (ref == null ? '' : ref);
      if (estado.feitas[chave]) return null;
      estado.feitas[chave] = true;
      return dar(def.sementes, def.texto);
    },

    /** Regista a visita de hoje e atualiza a streak. Passar uma data "YYYY-MM-DD" serve para testar. */
    registarVisita: function (diaISO) {
      var hoje = diaISO || hojeISO();
      if (estado.ultimoDia === hoje) return null; // já contou hoje

      if (estado.ultimoDia && diasEntre(estado.ultimoDia, hoje) === 1) estado.streak += 1;
      else estado.streak = 1;

      estado.ultimoDia = hoje;
      estado.melhorStreak = Math.max(estado.melhorStreak, estado.streak);

      var bonus = 10 + 5 * Math.min(estado.streak, 5); // 15, 20, 25, 30, 35, depois fixo
      return dar(bonus, 'Visita diária (dia ' + estado.streak + ' seguido)');
    },

    estado: function () { return estado; },
    niveis: function () { return niveis.slice(); },
    nivelAtual: function () { return nivelPara(estado.sementes); },

    proximoNivel: function () {
      var atual = nivelPara(estado.sementes);
      return niveis.find(function (n) { return n.sementes > atual.sementes; }) || null;
    },

    /** 0 a 1: quanto falta para o próximo nível (1 se já está no máximo). */
    progressoNivel: function () {
      var atual = nivelPara(estado.sementes), prox = Pontos.proximoNivel();
      if (!prox) return 1;
      return (estado.sementes - atual.sementes) / (prox.sementes - atual.sementes);
    },

    /** Lista de níveis com a flag "desbloqueado", para desenhar os desbloqueios. */
    desbloqueios: function () {
      return niveis.map(function (n) {
        return { nivel: n.nivel, nome: n.nome, sementes: n.sementes, texto: n.desbloqueia, desbloqueado: estado.sementes >= n.sementes };
      });
    },

    reset: function () {
      estado = novoEstado();
      guardar();
      avisar({ ganhou: 0, subiuNivel: false, nivel: nivelPara(0) });
    }
  };

  window.Pontos = Pontos;
})();