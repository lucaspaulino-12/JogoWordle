    //guarda todos os botoes num array
    const botoes = document.querySelectorAll('#keyboard button');

    //guarda o elemento table na variável
    const tabela = document.querySelector('table');

    //guarda as linhas da tabela na variável
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


    carregarEstatisticas();

    const start = document.getElementById('start-again');

    start.addEventListener('click', function(evt) {
        linhaAtual = 0;
        colunaAtual = 0;
        palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
        console.log("Nova palavra secreta:", palavraSecreta);

        if (linhaAtual >= 6) return;

        //limpa a tabela
        for (let i = 0; i < linhas.length; i++) {
            for (let j = 0; j < linhas[i].cells.length; j++) {
                linhas[i].cells[j].textContent = "";
                linhas[i].cells[j].style.backgroundColor = "";
                linhas[i].cells[j].style.color = "";
                linhas[i].cells[j].style.borderColor = "";
            }
        }

        //reset das cores do teclado
        for (let button of botoes) {
            button.style.backgroundColor = "";
            button.style.color = "";
            button.style.borderColor = "";
        }

        atualizarTeclado("");
        ativarTeclado();
    });

    desativarTeclado();

    //importa a lista de palavras do ficheiro JSON
    fetch('palavras.json')
    .then(res => res.json())
    .then(data => {
        listaPalavras = data.palavras;
        palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
        console.log("Palavra secreta:", palavraSecreta);
        ativarTeclado();
    })
    .catch(err => console.error("Erro a carregar palavras.json:", err));

    //percorre o array 
    for(var i = 0; i<botoes.length; i++){
        //está à espera que o utilizador carregue no botão e quando carrega corre a função. 
        //(function(evt) É uma função anónima (sem nome) que está a ser usada como "callback" do evento click.)
        //evt (ou event) é o objeto do evento, que contém informações sobre o clique, como:  Qual foi o botão clicado (evt.target), A posição do rato, Teclas pressionadas, etc.
        botoes[i].addEventListener('click', function(evt){

            if (linhaAtual >= 6) return;
            //guarda o texto do botão clicado na variável
            const letra = evt.target.textContent;

            //Se carregar o botão de apagar
            if(letra === "Apagar"){
                //só apaga se já tiver algo escrito
                if(colunaAtual > 0){
                    //anda uma célula para tras
                    colunaAtual--;
                    //limpa a letra
                    linhas[linhaAtual].cells[colunaAtual].textContent = "";
                }
                //se carregar o botão do enter
            } else if(letra === "Enter"){
                //só deixa submeter se tiver 5 letras
                if(colunaAtual === 5){
                    const tentativa = lerLinhaAtual();
                    const valido = verificarTentativa(tentativa);
                    if (valido) {
                        linhaAtual++;
                        colunaAtual = 0;
                    }
                //se não tiver 5 letras mostra mensagem de erro
                }else{
                    alert("Preencha 5 letras antes de continuar");
                }
            //quando é clicado uma letra normal e não houver 5 letras
            }else if (colunaAtual < 5){
                //Adiciona a letra à célula da tabela
                linhas[linhaAtual].cells[colunaAtual].textContent = letra;
                //avança para a próxima celula
                colunaAtual++;
            }
        });
    }


    function lerLinhaAtual(){
        let palavra = "";
        for(let i = 0; i < 5; i++){
            //junta as letras e guarda na variável
            palavra += linhas[linhaAtual].cells[i].textContent;
        }

        return palavra;
    }

    function desativarTeclado() {
        botoes.forEach(button => {
            button.disabled = true;
        });
    }

    function ativarTeclado() {
        botoes.forEach(button => {
            button.disabled = false;
        });
    }

    function verificarTentativa(tentativa){
        if(tentativa.length !== 5){
            alert("Preencha 5 letras antes de confirmar");
            return;
        }



        // Verifica se a palavra existe na lista
        if (!listaPalavras.includes(tentativa.toLowerCase())) {
            alert("Palavra inválida!");
            return false;
        }

        const tentativaArray = tentativa.toLowerCase().split("");
        const secretaArray = palavraSecreta.toLowerCase().split("");
        const resultado = ["", "", "", "", ""]; // guarda cor: "green", "yellow", "gray"
        const usadas = [false, false, false, false, false]; // marca letras já usadas na palavra secreta

        //verifica letras na posição correta (verdes)
        for (let i = 0; i < 5; i++) {
            if (tentativaArray[i] === secretaArray[i]) {
                resultado[i] = "green";
                usadas[i] = true; // marcar que essa letra foi usada
            }
        }

        //verifica letras na palavra mas posição errada (amarelas)
        for (let i = 0; i < 5; i++) {
            if (resultado[i] === "") { // se ainda não foi marcada como verde
                for (let j = 0; j < 5; j++) {
                    if (!usadas[j] && tentativaArray[i] === secretaArray[j]) {
                        resultado[i] = "yellow";
                        usadas[j] = true;
                        break;
                    }
                }
            }
        }

        //marca restantes como cinzento (não estão na palavra)
        for (let i = 0; i < 5; i++) {
            if (resultado[i] === "") {
                resultado[i] = "gray";
            }
        }

        // aplicar cores na grelha
        for (let i = 0; i < 5; i++) {
            const celula = linhas[linhaAtual].cells[i];
            const cor = resultado[i];
            const estilos = {
                green: "#6ca965",
                yellow: "#c8b653",
                gray: "#787c7f"
            };
            celula.style.backgroundColor = estilos[cor];
            celula.style.color = "white";
            celula.style.borderColor = estilos[cor];
        }

        atualizarTeclado(tentativaArray, resultado);

        // Vitória ou derrota
        if(tentativa.trim().toUpperCase() === palavraSecreta.trim().toUpperCase()){
            console.log("Parabéns!");
            numVitorias++;
            streak++;
            if (streak > maxStreak) maxStreak = streak; // atualiza a streak máxima
            guardarEstatisticas();
            overlayFinal(); // mostra o overlay
            desativarTeclado();
            som.play(); // toca o som de vitória
        } else if (linhaAtual === 5){
            console.log("Perdeste!");
            numDerrotas++;
            streak = 0;
            if (streak > maxStreak) maxStreak = streak; // atualiza a streak máxima
            guardarEstatisticas();
            desativarTeclado();
            alert("A palavra era: " + palavraSecreta);
        }
        
        return true; // indica que a tentativa foi válida
    }



    function reiniciarJogo() {
        linhaAtual = 0;
        colunaAtual = 0;
        palavraSecreta = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
        console.log("Nova palavra secreta:", palavraSecreta);

        //limpa a tabela
        for (let i = 0; i < linhas.length; i++) {
            for (let j = 0; j < linhas[i].cells.length; j++) {
                linhas[i].cells[j].textContent = "";
                linhas[i].cells[j].style.backgroundColor = "";
                linhas[i].cells[j].style.color = "";
                linhas[i].cells[j].style.borderColor = "";
            }
        }
        streak = 0;
        limparTeclado();  
        fecharOverlay();
        ativarTeclado();
    }

    function limparTeclado() {
        botoes.forEach(button => {
            button.style.backgroundColor = "";
            button.style.color = "";
            button.style.borderColor = "";
        });
    }

    function atualizarTeclado(tentativaArray, resultado) {
        const botoes = document.querySelectorAll("#keyboard button");

        for (let i = 0; i < tentativaArray.length; i++) {
            const letra = tentativaArray[i];
            const cor = resultado[i];

            botoes.forEach(botao => {
                if (botao.textContent.trim().toLowerCase() === letra.toLowerCase()) {
                    let novaCor;
                    if (cor === "green") novaCor = "#6ca965";
                    else if (cor === "yellow" && botao.style.backgroundColor !== "rgb(108, 169, 101)") {
                        novaCor = "#c8b653";
                    } else if (cor === "gray" && botao.style.backgroundColor !== "rgb(108, 169, 101)" && botao.style.backgroundColor !== "rgb(200, 182, 83)") {
                        novaCor = "#787c7f";
                    }

                    if (novaCor) {
                        botao.style.backgroundColor = novaCor;
                        botao.style.color = "white";
                        botao.style.borderColor = novaCor;
                    }
                }
            });
        }
    }

    function fecharOverlay() {
        document.getElementById("overlay").style.display = "none"; // Esconde o overlay
    }

    function mostrarOverlayEstatisticas() {
        atualizarEstatisticasNaPagina();
        document.getElementById("overlay-estatisticas").style.display = "flex";
    }

    function fecharOverlayEstatisticas() {
        document.getElementById("overlay-estatisticas").style.display = "none";
    }

    function atualizarEstatisticasNaPagina() {
        document.getElementById("jogos").textContent = numJogos;
        document.getElementById("vitorias").textContent = numVitorias;
        document.getElementById("derrotas").textContent = numDerrotas;
        document.getElementById("streak").textContent = streak;
        document.getElementById("maxStreak").textContent = maxStreak;
    }

    function mostrarMensagem(texto, cor = "black") {
    let div = document.getElementById("mensagem");

    // se não existir no HTML, cria automaticamente
    if (!div) {
        div = document.createElement("div");
        div.id = "mensagem";
        div.style.textAlign = "center";
        div.style.fontWeight = "bold";
        div.style.margin = "10px";
        div.style.height = "24px";
        document.body.appendChild(div);
    }

    div.textContent = texto;
    div.style.color = cor;

    setTimeout(() => {
        div.textContent = "";
    }, 2000);
}


    function overlayFinal() {
        document.getElementById("overlay").style.display = "flex"; // Esconde o overlay
        atualizarEstatisticasNaPagina();
    }

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
        const dados = JSON.parse(localStorage.getItem("estatisticas")); //tenta obter os dados do localStorage
        if (dados) {
            numJogos = dados.numJogos || 0;
            numVitorias = dados.numVitorias || 0;
            numDerrotas = dados.numDerrotas || 0;
            streak = dados.streak || 0;
            maxStreak = dados.maxStreak || 0;
        }
        atualizarEstatisticasNaPagina();
    }

    const botEstatisticas = document.getElementById("stats");

    botEstatisticas.addEventListener('click', function() {
        mostrarOverlayEstatisticas();
    });

    document.addEventListener("keydown", function(evt) {        
        if (linhaAtual >= 6 || !linhas[linhaAtual]) return;

        const tecla = evt.key; //guarda a tecla pressionada na variável

        //letras normais
        if (/^[a-zA-Z]$/.test(tecla)) {
            evt.preventDefault(); // impede o comportamento padrão do teclado
            if (colunaAtual < 5) {// verifica se ainda há espaço na linha atual
                linhas[linhaAtual].cells[colunaAtual].textContent = tecla.toUpperCase();
                colunaAtual++;
            }
        }

        else if (tecla === "Backspace" || tecla === "Delete") {
            evt.preventDefault();
            if (colunaAtual > 0) { // verifica se ainda há letras para apagar
                colunaAtual--;
                linhas[linhaAtual].cells[colunaAtual].textContent = "";
            }
        }

        //enter para submeter tentativa
        else if (tecla === "Enter") {
            evt.preventDefault();
            if (colunaAtual === 5) { //verifica se a linha está completa
                const tentativa = lerLinhaAtual();
                const valido = verificarTentativa(tentativa);
                if (valido) {
                    linhaAtual++;
                    colunaAtual = 0;
                }
            } else {
                mostrarMensagem("Preencha 5 letras antes de continuar", "red");
            }
        }
    });

    const som = new Audio('kids_cheering.mp3');

