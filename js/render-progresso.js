/* render-progresso.js — ecrã de progresso: Sementes, nível, streak, desbloqueios e árvore SVG (papel C)
 *
 * Depende de pontos.js (carregar antes). Expõe window.RenderProgresso.
 *
 * Uso no app.js:
 *   RenderProgresso.montar(document.getElementById('ecra-progresso'));
 * Redesenha sozinho sempre que o evento "pontos:mudou" é emitido.
 */
(function () {
  'use strict';

  // ---------- Árvore SVG ----------
  // Posições relativas ao topo do tronco: [dx, dy, raio]
  var COPA = [
    [0, -5, 26], [-22, 10, 20], [22, 10, 20], [0, -28, 22],
    [-30, -8, 16], [30, -8, 16], [-14, -42, 15], [14, -42, 15]
  ];
  var FRUTOS = [[-15, 0], [18, -12], [0, -30], [-28, 12], [26, 12]];
  var ALTURA_TRONCO = { 1: 0, 2: 45, 3: 70, 4: 95, 5: 110 };
  var N_CIRCULOS = { 1: 0, 2: 0, 3: 3, 4: 6, 5: 8 };

  function arvoreSVG(nivel, progresso) {
    var chao = 190;
    var n = Math.min(Math.max(nivel, 1), 5);
    var h = ALTURA_TRONCO[n] + (n < 5 ? progresso * 12 : 0); // cresce ligeiramente dentro do nível
    var topo = chao - h;
    var partes = [];

    partes.push('<ellipse cx="100" cy="' + (chao + 4) + '" rx="62" ry="9" class="arv-chao"/>');

    if (n === 1) {
      // só a semente na terra
      partes.push('<ellipse cx="100" cy="' + (chao - 4) + '" rx="9" ry="6" class="arv-semente"/>');
    } else {
      var largura = 3 + n * 1.6;
      partes.push('<path d="M' + (100 - largura) + ' ' + chao + ' L' + (100 - largura / 2) + ' ' + topo +
        ' L' + (100 + largura / 2) + ' ' + topo + ' L' + (100 + largura) + ' ' + chao + ' Z" class="arv-tronco"/>');

      if (n === 2) {
        // rebento: duas folhas
        partes.push('<path d="M100 ' + topo + ' q-26 -6 -30 -26 q24 0 30 26 z" class="arv-folha"/>');
        partes.push('<path d="M100 ' + (topo + 6) + ' q26 -6 30 -26 q-24 0 -30 26 z" class="arv-folha"/>');
      } else {
        var escala = 0.8 + 0.2 * (n === 5 ? 1 : progresso);
        var copa = ['<g transform="translate(100 ' + topo + ') scale(' + escala.toFixed(2) + ')">'];
        for (var i = 0; i < N_CIRCULOS[n]; i++) {
          var c = COPA[i];
          copa.push('<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" class="arv-copa arv-copa-' + (i % 3) + '"/>');
        }
        if (n === 5) {
          FRUTOS.forEach(function (f) {
            copa.push('<circle cx="' + f[0] + '" cy="' + f[1] + '" r="4.5" class="arv-fruto"/>');
          });
        }
        copa.push('</g>');
        partes.push(copa.join(''));
      }
    }

    return '<svg viewBox="0 0 200 215" role="img" aria-label="Árvore no nível ' + n + '" class="arvore-svg">' +
      partes.join('') + '</svg>';
  }

  // ---------- Ecrã ----------
  var raiz = null;
  var ultimoNivel = null;

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function desenhar(detalhe) {
    if (!raiz || !window.Pontos) return;

    var P = window.Pontos;
    var est = P.estado();
    var atual = P.nivelAtual();
    var prox = P.proximoNivel();
    var pct = Math.round(P.progressoNivel() * 100);
    var subiu = detalhe && detalhe.subiuNivel;

    var falta = prox ? (prox.sementes - est.sementes) : 0;
    var legenda = prox
      ? 'Faltam ' + falta + ' Sementes para "' + esc(prox.nome) + '"'
      : 'Nível máximo atingido';

    var desbloq = P.desbloqueios().map(function (d) {
      return '<li class="desbloqueio ' + (d.desbloqueado ? 'aberto' : 'fechado') + '">' +
        '<span class="desbloqueio-estado">' + (d.desbloqueado ? 'Desbloqueado' : d.sementes + ' Sementes') + '</span>' +
        '<span class="desbloqueio-texto">' + esc(d.texto) + '</span></li>';
    }).join('');

    var historico = est.historico.slice(0, 4).map(function (h) {
      return '<li><span>' + esc(h.texto) + '</span><strong>+' + h.sementes + '</strong></li>';
    }).join('') || '<li class="vazio">Ainda sem atividade. Preenche o teu perfil para ganhar as primeiras Sementes.</li>';

    raiz.innerHTML =
      '<div class="progresso">' +
        '<div class="progresso-arvore' + (subiu ? ' cresceu' : '') + '">' + arvoreSVG(atual.nivel, P.progressoNivel()) + '</div>' +
        '<div class="progresso-info">' +
          '<p class="progresso-nivel">Nível ' + atual.nivel + ' · ' + esc(atual.nome) + '</p>' +
          '<p class="progresso-sementes"><strong>' + est.sementes + '</strong> Sementes</p>' +
          '<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
            '<div class="barra-cheia" style="width:' + pct + '%"></div></div>' +
          '<p class="progresso-legenda">' + legenda + '</p>' +
          '<p class="progresso-streak">' + (est.streak > 0
            ? est.streak + (est.streak === 1 ? ' dia seguido' : ' dias seguidos') + ' (melhor: ' + est.melhorStreak + ')'
            : 'Volta amanhã para começares uma sequência') + '</p>' +
        '</div>' +
        '<section class="progresso-bloco"><h3>O que podes desbloquear</h3><ul class="desbloqueios">' + desbloq + '</ul></section>' +
        '<section class="progresso-bloco"><h3>Atividade recente</h3><ul class="historico">' + historico + '</ul></section>' +
      '</div>';

    if (subiu && ultimoNivel !== atual.nivel) {
      var aviso = document.createElement('p');
      aviso.className = 'progresso-aviso';
      aviso.setAttribute('role', 'status');
      aviso.textContent = 'Subiste para "' + atual.nome + '"! Desbloqueaste: ' + atual.desbloqueia;
      raiz.querySelector('.progresso').prepend(aviso);
    }
    ultimoNivel = atual.nivel;
  }

  window.RenderProgresso = {
    montar: function (elemento) {
      raiz = elemento;
      ultimoNivel = window.Pontos ? window.Pontos.nivelAtual().nivel : null;
      desenhar();
      document.removeEventListener('pontos:mudou', onMudou);
      document.addEventListener('pontos:mudou', onMudou);
    },
    redesenhar: desenhar
  };

  function onMudou(e) { desenhar(e.detail); }

  // ---------- Integração com o esqueleto do grupo ----------

  // Contador do cabeçalho (<p id="sementes">). O app.js já chama atualizarSementes() no arranque;
  // esta versão lê os valores do Pontos. Também corre sempre que as Sementes mudam.
  function atualizarSementes() {
    var el = document.getElementById('sementes');
    if (el && window.Pontos) el.textContent = window.Pontos.estado().sementes + ' Sementes';
  }
  window.atualizarSementes = atualizarSementes;
  document.addEventListener('pontos:mudou', atualizarSementes);

  // Arranque automático: só acontece se existir <div id="progresso-conteudo"> no index.html.
  // Assim não é preciso mexer no app.js do A.
  var alvo = document.getElementById('progresso-conteudo');
  if (alvo && window.Pontos) {
    window.Pontos.init().then(function () {
      window.RenderProgresso.montar(alvo);
      window.Pontos.registarVisita();
      atualizarSementes();
    });
  }
})();
