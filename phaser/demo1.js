var w = 800;
var h = 400;
var jugador;
var fondo;

var bala, balaD = false, nave;

var salto;
var menu;

var velocidadBala;
var despBala;
var estatusAire;
var estatusSuelo;

//Declaración de bala nueva
var balaN;
var balaDN = false;
var despBalaN;

//Declaración de variables para moverse de der a izq
var btns;

//Declaración de variables para saber su posición horizontal
var estatusDer;
var estatusIzq;

//Valores para el csv
var csv = [
    [
        //"despBala",
        //"velocidadBala",
        "despBalaN",
        // "estatusAire",
        "estatusDer",
        "estatusIzq",
    ],
]

var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto = false;

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h - 70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');

    //Creación de nueva bala
    balaN = juego.add.sprite(w - 100, h, 'bala');

    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    //Modificación
    juego.physics.enable(balaN);
    balaN.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Asignación de teclas para izq y der
    btns = juego.input.keyboard.createCursorKeys();
    
    nnNetwork =  new synaptic.Architect.Perceptron(3,10,3,3);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {log: 1000, rate: 0.0003, iterations: 10000, shuffle: true});
}

function datosDeEntrenamiento(param_entrada){

    //
    console.log(
        "Entrada", 
        param_entrada[0] + " " + param_entrada[1] + " " + param_entrada[2]
        );
    nnSalida = nnNetwork.activate(param_entrada);
    console.log("NNSALIDA");
    console.log(nnSalida);
    return [nnSalida[0] > 0.5 ? 1 : 0, nnSalida[1], nnSalida[2]];

}

function pausa(){
    reiniciarJuego();
    juego.paused = true;
    menu = juego.add.sprite(w/2, h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90){
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if(!eCompleto) {
                    console.log("", "Entrenamiento " + datosEntrenamiento.length + " valores" );
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;

        }
    }
}

function resetVariables(){
    //jugador.body.velocity.x = 0;

    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;
}

//Función para reiniciar la bala nueva
function resetVariablesBalaN(){
    balaN.body.velocity.x = 0;
    balaN.position.x = jugador.body.position.x;
    balaN.position.y = 0;
    balaDN = false;
}

//
function reiniciarJuego(){
    jugador.body.position.x = 50;
	jugador.body.position.y = h;
	jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
    
	bala.body.velocity.x = 0;
	bala.position.x = w - 100;
	balaD = false;

	balaN.body.velocity.x = 0;
	balaN.position.x = jugador.body.position.x;
	balaN.position.y = 0;
	balaDN = false;
}

function saltar(){
    jugador.body.velocity.y = -270;
}

//Funcion para moverse a der
function derecha(){
    jugador.body.velocity.x = 150;
    estatusIzq = 0;
    estatusDer = 1;
}

//Funcion para moverse a izq
function izquierda(){
    jugador.body.velocity.x = -150;
    estatusIzq = 1;
    estatusDer = 0;
}

//
function modMan() {
    jugador.body.velocity.x = 0;
	estatusIzq = 0;
	estatusDer = 0;
    if(salto.isDown && jugador.body.onFloor() ){
        saltar();
    }

    if (btns.right.isDown ){
        derecha();
    }

    if (btns.left.isDown ){
        izquierda();
    }
}

function modAut(){
    if (bala.position.x > 0) {
        jugador.body.velocity.x = 0;
	    estatusIzq = 0;
	    estatusDer = 0;
        var data = datosDeEntrenamiento([despBala, velocidadBala, despBalaN])
        console.log("DATA: ");
		console.log(data);
        if (data[0]) {
            if (jugador.body.onFloor()) {
                saltar();
            }
		}
		if (data[1] > data[2]) {
            izquierda();
            // estatusIzq = 1;
		    // estatusDer = 0;
		}
        if (data[2] > data[1]) {
            derecha();
			// estatusIzq = 0;
		    // estatusDer = 1;
		}
	}
}

function update() {
    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    //Agregamos la colisión para la bala nueva
    juego.physics.arcade.collide(balaN, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;

    if(!jugador.body.onFloor()) {
        estatusSuelo = 0;
        estatusAire = 1;
    }
	
    despBala = Math.floor( jugador.position.x - bala.position.x );
    //Desplazamiento para la bala nueva
    despBalaN = Math.floor( balaN.position.y - jugador.position.y );

    if( modoAuto == false){
        modMan();
    } else {
        modAut();
    }

    if( balaD == false ){
        disparo();
    } 

    if( bala.position.x <= 0  ){
        resetVariables();
    }

    if( balaN.position.y >= 383){
        resetVariablesBalaN();
    }
    
    //agergar valores a la lista de entrenamiento
    if( modoAuto == false  && bala.position.x > 0 ){
        csv.push([
            despBalaN,
            //velocidadBala,
            // despBalaN,
            // estatusAire,
            estatusIzq,
            estatusDer,
        ]);
        datosEntrenamiento.push({
            input:  [despBala , velocidadBala, despBalaN],
            output:  [estatusAire, estatusIzq, estatusDer ], 
        });

        console.log(`Bala 1: ${despBala}, Velocidad bala 1: ${velocidadBala}, Bala nueva: ${despBalaN}, Estatus aire: ${estatusAire}, Estatus izquierda: ${estatusIzq}, Estatus derecha: ${estatusDer}`);
   }

}

function disparo(){
    velocidadBala =  -1 * velocidadRandom(300, 500);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD = true;
}

function colisionH(){
    pausa();

    //Generar archivo de Excel
    var csvContent = 
        "data:text/csv;charset=utf-8,"+
        csv.map((e) => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    //window.open(encodedUri);
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}
