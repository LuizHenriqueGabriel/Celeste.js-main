const canvas = document.getElementById("canvas");
// Define a resolução interna do jogo; o CSS pode redimensionar a exibição sem mudar a física.
canvas.width = 1200;
canvas.height = 720;
const ctx = canvas.getContext("2d");



// nesta parte, criamos um objeto de imagem que pega a imagem do menu e do round
const menuImage = new Image();
const roundImage = new Image();
menuImage.src = "./assets/menu.png";
roundImage.src = "./assets/cenario.png";




// aqui é o status padrão sempre que iniciar o site (aparecendo o menu)
let gameStatus = "menu";



menuImage.onload = function (){
    draw();
}



// essa função desenha a imagem cobrindo todo o canvas
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStatus === "menu"){
        ctx.drawImage(
            menuImage,
            0,
            0,
            canvas.width,
            canvas.height
        )
    }
}




// comando para iniciar o jogo ao clicar enter
document.addEventListener("keydown", (event) => {
    if(event.key === "Enter" && gameStatus === "menu"){
        gameStatus = "playing";
        startGame();
    }
})



const player = new Player();
let platforms = [];
let phaseReady = false;

// Carrega os retângulos desenhados na camada "Colisoes" do mapa do Tiled.
fetch("./assets/fase1.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Não foi possível carregar fase1.json");
        }
        return response.json();
    })
    .then((map) => {
        const sceneLayer = map.layers.find((layer) => layer.name === "Cenario");
        const collisionLayer = map.layers.find((layer) => layer.name === "Colisoes");

        if (!sceneLayer || !collisionLayer) {
            throw new Error("O mapa precisa das camadas Cenario e Colisoes");
        }

        const scaleX = canvas.width / sceneLayer.imagewidth;
        const scaleY = canvas.height / sceneLayer.imageheight;

        // Converte as coordenadas da imagem original para as coordenadas do canvas.
        platforms = collisionLayer.objects.map((object) => ({
            x: object.x * scaleX,
            y: object.y * scaleY,
            width: object.width * scaleX,
            height: object.height * scaleY
        }));

        // Só inicia o jogo depois que as colisões da fase estiverem prontas.
        phaseReady = true;
        if (gameStatus === "playing") {
            startGame();
        }
    })
    .catch((error) => console.error("Erro ao carregar a fase:", error));



document.addEventListener("keydown", (event) => {
    player.keys[event.key] = true;

    // Atira ao pressionar a tecla F
    if (event.key.toLowerCase() === "f" && !event.repeat) {
        player.atirar();
    }
});

document.addEventListener("keyup", (event) => {
    player.keys[event.key] = false;
})

// função que faz o gameloop
function gameLoop(){
    ctx.clearRect( 0, 0, canvas.width, canvas.height);

    if(roundImage.complete && roundImage.naturalWidth > 0){
        ctx.drawImage(
            roundImage,
            0,
            0,
            canvas.width,
            canvas.height
        )
    }

    player.updatePlayer(platforms);
    player.atualizarProjeteis();
    player.drawPlayer();
    requestAnimationFrame(gameLoop);
}





// função que faz o jogo iniciar
function startGame(){
    if(gameStatus === "playing" && phaseReady){
        gameLoop();
    }
}