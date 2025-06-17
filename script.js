// Jogo Wordle - Script.js

//variaveis globais

const botoes = document.querySelectorAll('#keyboard button');
const tabela = document.querySelector('table');
const linhas = tabela.rows;

let linhaAtual = 0;
let colunaAtual = 0;
let listaPalavras = [];
let palavraSecreta = "";

let numJogos = 0;
let numVitorias = 0;
let numDerrotas = 0;
let streak = 0;
let maxStreak = 0;
let jogoContabilizado = false;

const soundWin = new Audio('kids_cheering.mp3');
const soundLoss = new Audio('losing_horn.mp3');
const wrongWordSound = new Audio('wrong.mp3');
soundWin.volume = 0.4;
soundLoss.volume = 0.5;
wrongWordSound.volume = 0.3;


//inicializacao

carregarEstatisticas();

fetch('palavras.json')
    .then(res => res.json())
    .then(data => {
        listaPalavras = data.palavras;
        palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
        ativarTeclado();
    })
    .catch(err => console.error("Erro a carregar palavras.json:", err));


//teclado Virtual

botoes.forEach(botao => {
    botao.addEventListener('click', function (evt) {
        if (linhaAtual >= 6) return;

        const letra = evt.target.textContent;

        if (letra === "Apagar") {
            if (colunaAtual > 0) {
                colunaAtual--;
                linhas[linhaAtual].cells[colunaAtual].textContent = "";
            }else {
                mostrarMensagem("Não pode apagar o vazio! 🤨");
            }
        } else if (letra === "Enter") {
            if (colunaAtual === 5) {
                const tentativa = lerLinhaAtual();
                const valido = verificarTentativa(tentativa);
                if (valido) {
                    linhaAtual++;
                    colunaAtual = 0;
                }
            } else {
                mostrarMensagem("Insira 5 letras antes de continuar!");
            }
        } else if (colunaAtual < 5) {
            linhas[linhaAtual].cells[colunaAtual].textContent = letra;
            colunaAtual++;
        }
    });
});


//teclado fisico

document.addEventListener("keydown", function (evt) {
    if (linhaAtual >= 6 || !linhas[linhaAtual]) return;

    const tecla = evt.key;

    if (/^[a-zA-Z]$/.test(tecla)) {
        evt.preventDefault();
        if (colunaAtual < 5) {
            linhas[linhaAtual].cells[colunaAtual].textContent = tecla.toUpperCase();
            colunaAtual++;
        }
    } else if (tecla === "Backspace" || tecla === "Delete") {
        evt.preventDefault();
        if (colunaAtual > 0) {
            colunaAtual--;
            linhas[linhaAtual].cells[colunaAtual].textContent = "";
        }else{
            mostrarMensagem("Não pode apagar o vazio! 🤨");
        }
    } else if (tecla === "Enter") {
        evt.preventDefault();
        if (colunaAtual === 5) {
            const tentativa = lerLinhaAtual();
            const valido = verificarTentativa(tentativa);
            if (valido) {
                linhaAtual++;
                colunaAtual = 0;
            }
        } else {
            mostrarMensagem("Insira 5 letras antes de continuar");
        }
    }
});


//funções principais

function lerLinhaAtual() {
    let palavra = "";
    for (let i = 0; i < 5; i++) {
        palavra += linhas[linhaAtual].cells[i].textContent;
    }
    return palavra;
}

function verificarTentativa(tentativa) {
    if (tentativa.length !== 5) return false;

    if (!listaPalavras.includes(tentativa.toLowerCase())) {
        tremerLinhaAtual();
        mostrarMensagem("Palavra Inválida!");
        wrongWordSound.play();
        return false;
    }

    const tentativaArray = tentativa.toLowerCase().split("");
    const secretaArray = palavraSecreta.toLowerCase().split("");
    const resultado = ["", "", "", "", ""];
    const usadas = [false, false, false, false, false];

    for (let i = 0; i < 5; i++) {
        if (tentativaArray[i] === secretaArray[i]) {
            resultado[i] = "green";
            usadas[i] = true;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (resultado[i] === "") {
            for (let j = 0; j < 5; j++) {
                if (!usadas[j] && tentativaArray[i] === secretaArray[j]) {
                    resultado[i] = "yellow";
                    usadas[j] = true;
                    break;
                }
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        if (resultado[i] === "") resultado[i] = "gray";
    }

    const estilos = {
        green: "#6ca965",
        yellow: "#c8b653",
        gray: "#787c7f"
    };

    for (let i = 0; i < 5; i++) {
        const celula = linhas[linhaAtual].cells[i];
        const cor = resultado[i];
        setTimeout(() => {
            celula.classList.add("flip");
            celula.style.backgroundColor = estilos[cor];
            celula.style.color = "white";
            celula.style.borderColor = estilos[cor];
            setTimeout(() => celula.classList.remove("flip"), 600);
        }, i * 300);
    }

    atualizarTeclado(tentativaArray, resultado);

    if (tentativa.trim().toUpperCase() === palavraSecreta.trim().toUpperCase()) {
        console.log("Parabéns!");
        numVitorias++;
        streak++;
        if (streak > maxStreak) maxStreak = streak;

        if (!jogoContabilizado){
            numJogos++;
            jogoContabilizado = true;
        }

        guardarEstatisticas();
        overlayFinal();
        desativarTeclado();
        soundWin.play();
    } else if (linhaAtual === 5) {
        if (streak > maxStreak) maxStreak = streak;
        numDerrotas++;
        streak = 0;

        if (!jogoContabilizado){
            numJogos++;
            jogoContabilizado = true;
        }

        guardarEstatisticas();
        soundLoss.play();
        overlayDerrota();
        desativarTeclado();
        mostrarMensagem(`A palavra era: ${palavraSecreta}`);
    }

    return true;
}


//funcoes tremer linha, mensagem e atualizar teclado


function tremerLinhaAtual() {
    for (let i = 0; i < 5; i++) {
        const celula = linhas[linhaAtual].cells[i];
        celula.classList.add("shake");
        setTimeout(() => celula.classList.remove("shake"), 300);
    }
}

function mostrarMensagem(texto, tempo = 2000) {
    const m = document.getElementById("mensagem");
    m.textContent = texto;
    m.classList.add("visivel");
    setTimeout(() => m.classList.remove("visivel"), tempo);
}

function atualizarTeclado(tentativaArray, resultado) {
    botoes.forEach(botao => {
        const letraBotao = botao.textContent.trim().toLowerCase();
        tentativaArray.forEach((letra, i) => {
            if (letraBotao === letra.toLowerCase()) {
                let novaCor;
                if (resultado[i] === "green") novaCor = "#6ca965";
                else if (resultado[i] === "yellow" && botao.style.backgroundColor !== "rgb(108, 169, 101)")
                    novaCor = "#c8b653";
                else if (resultado[i] === "gray" && botao.style.backgroundColor !== "rgb(108, 169, 101)" && botao.style.backgroundColor !== "rgb(200, 182, 83)")
                    novaCor = "#787c7f";

                if (novaCor) {
                    botao.style.backgroundColor = novaCor;
                    botao.style.color = "white";
                    botao.style.borderColor = novaCor;
                }
            }
        });
    });
}


//estado do teclado

function desativarTeclado() {
    botoes.forEach(button => button.disabled = true);
}

function ativarTeclado() {
    botoes.forEach(button => button.disabled = false);
}

function limparTeclado() {
    botoes.forEach(button => {
        button.style.backgroundColor = "";
        button.style.color = "";
        button.style.borderColor = "";
    });
}


//Overlays e Estatísticas

//overlay de vitória
function overlayFinal() {
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("container-continuar-jogo").style.display = "block";
    document.getElementById("jogos").textContent = numJogos;
    document.getElementById("vitorias").textContent = numVitorias;
    document.getElementById("derrotas").textContent = numDerrotas;
    document.getElementById("streak").textContent = streak;
    document.getElementById("maxStreak").textContent = maxStreak;
}

function overlayDerrota() {
    document.getElementById("overlay-derrota").style.display = "flex";
    document.getElementById("palavra-correta").textContent = palavraSecreta;
    document.getElementById("container-continuar-jogo").style.display = "block";

    document.getElementById("palavra-correta").textContent = palavraSecreta;
    document.getElementById("jogos-loss").textContent = numJogos;
    document.getElementById("vitorias-loss").textContent = numVitorias;
    document.getElementById("derrotas-loss").textContent = numDerrotas;
    document.getElementById("streak-loss").textContent = streak;
    document.getElementById("maxStreak-loss").textContent = maxStreak;
}

function mostrarOverlayEstatisticas() {
    document.getElementById("overlay-estatisticas").style.display = "flex";
    document.getElementById("jogos-estat").textContent = numJogos;
    document.getElementById("vitorias-estat").textContent = numVitorias;
    document.getElementById("derrotas-estat").textContent = numDerrotas;
    document.getElementById("streak-estat").textContent = streak;
    document.getElementById("maxStreak-estat").textContent = maxStreak;
}

  function resetEstatisticas() {
        numJogos = 0;
        numVitorias = 0;
        numDerrotas = 0;
        streak = 0;
        maxStreak = 0;
        document.getElementById("jogos-estat").textContent = numJogos;
        document.getElementById("vitorias-estat").textContent = numVitorias;
        document.getElementById("derrotas-estat").textContent = numDerrotas;
        document.getElementById("streak-estat").textContent = streak;
        document.getElementById("maxStreak-estat").textContent = maxStreak;
        guardarEstatisticas();
        mostrarMensagem("Estatísticas reiniciadas!");
    }

//fecha overlay de vitória
function fecharOverlay() {
    document.getElementById("overlay").style.display = "none";
}

//fecha overlay de estatísticas
function fecharOverlayEstatisticas() {
    document.getElementById("overlay-estatisticas").style.display = "none";
   
}

//fecha overlay de derrota
function fecharOverlayDerrota() {
    document.getElementById("overlay-derrota").style.display = "none";
}




//Reiniciar e Jogar Novamente//

//reinicia o jogo, reinicia a streak
function reiniciarJogo() {
    linhaAtual = 0;
    colunaAtual = 0;
    palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
    console.log("Nova palavra secreta:", palavraSecreta);

    for (let i = 0; i < linhas.length; i++) {
        for (let j = 0; j < linhas[i].cells.length; j++) {
            linhas[i].cells[j].textContent = "";
            linhas[i].cells[j].style.backgroundColor = "";
            linhas[i].cells[j].style.color = "";
            linhas[i].cells[j].style.borderColor = "";
        }
    }

    streak = 0;
    jogoContabilizado = false;
    limparTeclado();
    fecharOverlay();
    fecharOverlayDerrota();
    document.getElementById("container-continuar-jogo").style.display = "none";
    ativarTeclado();
}

//reinicia o jogo, continuação da streak
function jogarNovamente() {
    linhaAtual = 0;
    colunaAtual = 0;
    palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
    console.log("Nova palavra secreta:", palavraSecreta);

    for (let i = 0; i < linhas.length; i++) {
        for (let j = 0; j < linhas[i].cells.length; j++) {
            linhas[i].cells[j].textContent = "";
            linhas[i].cells[j].style.backgroundColor = "";
            linhas[i].cells[j].style.color = "";
            linhas[i].cells[j].style.borderColor = "";
        }
    }

    limparTeclado();
    fecharOverlay();
    jogoContabilizado = false;
    document.getElementById("container-continuar-jogo").style.display = "none";
    ativarTeclado();
}

function continuarJogo() {
    document.getElementById("container-continuar-jogo").style.display = "none";
    fecharOverlayDerrota();
    ativarTeclado();
}



//guardar e carregar do LocalStorage

function guardarEstatisticas() {
    localStorage.setItem("estatisticas", JSON.stringify({
        numJogos,
        numVitorias,
        numDerrotas,
        streak,
        maxStreak
    }));
}

function carregarEstatisticas() {
    const dados = JSON.parse(localStorage.getItem("estatisticas"));
    if (dados) {
        numJogos = dados.numJogos || 0;
        numVitorias = dados.numVitorias || 0;
        numDerrotas = dados.numDerrotas || 0;
        streak = dados.streak || 0;
        maxStreak = dados.maxStreak || 0;
    }
}
