
class Player {

    constructor() {
        this.playerImage = new Image();
        this.playerImage.src = 'assets/astronaut.png';

        // Direção: 1 = direita, -1 = esquerda
        this.direcao = 1;

        // Projéteis disparados pelo jogador
        this.projeteis = [];
    }

    // Informações do jogador
    width = 50;
    height = 50;
    pos_x = 550;
    pos_y = 558;
    speed = 6.5;
    velocityY = 0;
    gravity = 0.2;
    jumpForce = 8;
    onGround = true;
    jumpWasDown = false;
    keys = {};

    // Desenha o astronauta conforme seu movimento
    drawPlayer() {
        if (!this.playerImage.complete) {
            ctx.fillStyle = "red";
            ctx.fillRect(
                this.pos_x, this.pos_y,
                this.width, this.height
            );
            return;
        }

        // Identifica a direção pelas teclas pressionadas
        if (this.keys["ArrowRight"] || this.keys["d"]) {
            this.direcao = 1;
        } else if (this.keys["ArrowLeft"] || this.keys["a"]) {
            this.direcao = -1;
        }

        const andando =
            this.keys["ArrowRight"] || this.keys["d"] ||
            this.keys["ArrowLeft"] || this.keys["a"];

        // A spritesheet possui 4 colunas e 2 linhas.
        // Cada quadro mede 64 x 80 pixels.
        let frameX = 0;
        let frameY = 80;

        if (!this.onGround) {
            // Quadro de pulo com propulsão nos pés
            frameX = 128;
            frameY = 0;
        } else if (andando) {
            // Alterna os quadros para simular caminhada
            frameX = (Math.floor(this.pos_x / 8) % 2) * 64;
        }

        ctx.save();

        // Espelha o astronauta quando olha para a esquerda
        if (this.direcao === -1) {
            ctx.translate(this.pos_x + this.width, this.pos_y);
            ctx.scale(-1, 1);

            ctx.drawImage(
                this.playerImage,
                frameX, frameY, 64, 80,
                0, 0, this.width, this.height
            );
        } else {
            ctx.drawImage(
                this.playerImage,
                frameX, frameY, 64, 80,
                this.pos_x, this.pos_y,
                this.width, this.height
            );
        }

        ctx.restore();

        // Desenha os projéteis na cor azul
        ctx.fillStyle = "#00BFFF";

        for (const projetil of this.projeteis) {
            ctx.beginPath();
            ctx.arc(
                projetil.x, projetil.y,
                5, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Comando de disparo: deverá ser chamado pelo controle do jogo
    atirar() {
        this.projeteis.push({
            x: this.direcao === 1
                ? this.pos_x + this.width
                : this.pos_x,
            y: this.pos_y + this.height / 2,
            velocidade: 10 * this.direcao
        });
    }

    // Atualiza a posição dos projéteis
    atualizarProjeteis() {
        for (const projetil of this.projeteis) {
            projetil.x += projetil.velocidade;
        }

        this.projeteis = this.projeteis.filter(
            projetil =>
                projetil.x >= 0 &&
                projetil.x <= canvas.width
        );
    }


    // função que faz o jogador andar e pular pelo canvas
    updatePlayer(platforms){

        if(this.keys["ArrowRight"] || this.keys["d"]){
            this.pos_x += this.speed;
        }
        

        if(this.keys["ArrowLeft"] || this.keys["a"]){
            this.pos_x -= this.speed;
        }

        const jumpKeyDown = this.keys["ArrowUp"] || this.keys["w"];

        if(jumpKeyDown && !this.jumpWasDown && this.onGround){
            this.velocityY = -this.jumpForce;
            this.onGround = false;
        }

        this.jumpWasDown = jumpKeyDown;

        // Mantém o jogador dentro das bordas do canvas.
        this.pos_x = Math.max(0, Math.min(this.pos_x, canvas.width - this.width));

        // Guarda a posição dos pés antes do movimento para detectar se cruzaram uma plataforma.
        const previousBottom = this.pos_y + this.height;
        this.velocityY += this.gravity;
        this.pos_y += this.velocityY;
        this.onGround = false;

        for (const platform of platforms) {
            const overlapsHorizontally =
                this.pos_x < platform.x + platform.width &&
                this.pos_x + this.width > platform.x;
            const currentBottom = this.pos_y + this.height;

            if (
                // Aterrissa apenas ao cair, vindo de cima e sobrepondo a plataforma na horizontal.
                this.velocityY >= 0 &&
                previousBottom <= platform.y &&
                currentBottom >= platform.y &&
                overlapsHorizontally
            ) {
                this.pos_y = platform.y - this.height;
                this.velocityY = 0;
                this.onGround = true;
            }
        }
    }
}