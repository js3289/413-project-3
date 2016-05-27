// Globals + constants start here. All comments until setup function
	var HEIGHT = 500;
	var WIDTH = 500;
	var SCALE = 1;
	var gameState;

// Aliases
	TextureImage = PIXI.Texture.fromImage;
	TextureFrame = PIXI.Texture.fromFrame;
	Sprite = PIXI.Sprite;
	Container = PIXI.Container;
	Renderer = PIXI.autoDetectRenderer;
	Sound = PIXI.audioManager.getAudio;

// Gameport, renderer, All containers + stage
	var gameport = document.getElementById("gameport");
	var renderer = new Renderer(WIDTH, HEIGHT);
	
	gameport.appendChild(renderer.view);

	var stage 		= new Container();
	var gameplayC		= new Container();
	var titleC 			= new Container();
	var instructionsC 	= new Container();
	var puzzleC 		= new Container();
	var menuC 			= new Container();
	var creditsC 		= new Container();
	var winC			= new Container();
	var mainMenuC		= new Container();
	
	stage.scale.x = SCALE;
	stage.scale.y = SCALE;

	var allowMovement = true;

// Constants for anchoring sprites
	var LEFT = 0;
	var TOP = 0;
	var MIDDLE = .5;
	var BOTTOM = 1;
	var RIGHT = 1;

// Misc globals used in game
	var character;
	var emptyTile;
	var keysActive;
	var tiles;
	var menu;
	var hasWon;
	var posArr;
	var slide;
	var splash;
	var isAnimating;
	
	var keysActive = [];
	var floorData = [];
	var world;
	var tu;
	
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	PIXI.loader
		.add('map.json')
		.add('tileset.png')
		.add('Assets/png/Character-sprite.png')
		.add('TileSlide.mp3')
		.add('Assets/Sounds/Splash.mp3')
		.add('Assets/png/menuSheet.json')
		.load(setup);

function handleCollision() {
	var hasCollision;
	
	hasCollision = tu.hitTestTile(character.boundingSprite, floorData, 39, world, "some");
	
	if(hasCollision.hit) {
		console.log("Collision!");
	}
	return hasCollision.hit;
}

function hasWon() {
	var won = false;
	won = tu.hitTestTile(character.boundingSprite, floorData, 5, world, "some").hit;
	return won
}

function keepInBounds() {
	var collision = false;
	
	if(character.x < 16) {
		character.x = 16;
		character.boundingSprite.x = 8;
		slide.play();
	}
	if(character.x > 944) {
		character.x = 944;
		character.boundingSprite.x = 936;
		slide.play();
	}
	if(character.y < 16) {
		character.y = 16;
		character.boundingSprite.y = 8;
		slide.play();
	}
	if(character.y > 944) {
		character.y = 944;
		character.boundingSprite.y = 936;
		slide.play();
	}
}

function setup() {
	tu = new TileUtilities(PIXI);
	world = tu.makeTiledWorld("map.json", "tileset.png");
	gameplayC.addChild(world);
	slide = PIXI.audioManager.getAudio("TileSlide.mp3");
	splash = PIXI.audioManager.getAudio("Assets/Sounds/Splash.mp3");
	
	var temp = world.getObject("Player");
	
	character = new Player("Player", "Assets/png/Character-sprite.png");
	
	var entity_layer = world.getObject("Entities");
	
	floorData = world.getObject("Floor").data;
	console.log(floorData);
	console.log(character);
	document.addEventListener('keydown', function (e) {
		keysActive[e.keyCode] = true;
		e.preventDefault();
		});
	
	document.addEventListener('keyup', function (e) {
		keysActive[e.keyCode] = false;
		e.preventDefault();
		});
	
	entity_layer.addChild(character);
	entity_layer.addChild(character.boundingSprite);
	console.log(world.tileheight + " : " + world.tilewidth + " : " + world.widthInTiles);
	
	stage.addChild(gameplayC);
	fillContainers();
	animate();
}

function fillContainers() {
	// Create background. Center background + add it to stage.
	var background = new Sprite(TextureFrame("background-final.png"));
	background.anchor.x = MIDDLE;
	background.anchor.y = MIDDLE;
	background.position.x = WIDTH / 2;
	background.position.y = HEIGHT / 2;

// Add background to stage
	gameplayC.addChild(background);

	
// Main menu
	mainMenuC.addChild(new Sprite(TextureFrame("menu.png")));
	
	// play button
	playButton = new Sprite(TextureFrame("Play-button.png"));
	playButton.anchor.x = LEFT;
	playButton.anchor.y = TOP;
	playButton.x = 154;
	playButton.y = 150;
	
	playButton.interactive = true;
	playButton.on('mousedown', function() { controlState("play") } );
	
	mainMenuC.addChild(playButton);
	
	// instructions button
	instructionsButton = new Sprite(TextureFrame("Instructions-button.png"));
	instructionsButton.anchor.x = LEFT;
	instructionsButton.anchor.y = TOP;
	instructionsButton.x = 154;
	instructionsButton.y = 260;
	
	instructionsButton.interactive = true;
	instructionsButton.on('mousedown', function() { controlState("instructions") } );
	
	mainMenuC.addChild(instructionsButton);
	
	// credits button
	creditsButton = new Sprite(TextureFrame("Credits-button.png"));
	creditsButton.anchor.x = LEFT;
	creditsButton.anchor.y = TOP;
	creditsButton.x = 154;
	creditsButton.y = 370;
	
	
	creditsButton.interactive = true;
	creditsButton.on('mousedown', function() { controlState("credits") } );
	
	mainMenuC.addChild(creditsButton);
	
// Instructions
	instructionsC.addChild(new Sprite(TextureFrame("Instructions.png")));

	// back button
	backButton = new Sprite(TextureFrame("Back-button.png"));
	backButton.anchor.x = LEFT;
	backButton.anchor.y = TOP;
	backButton.x = 154;
	backButton.y = 370;
	
	
	backButton.interactive = true;
	backButton.on('mousedown', function() { controlState("main") } );
	
	instructionsC.addChild(backButton);
	
// Credits
	creditsC.addChild(new Sprite(TextureFrame("Credits.png")));

	// back button
	backButton = new Sprite(TextureFrame("Back-button.png"));
	backButton.anchor.x = LEFT;
	backButton.anchor.y = TOP;
	backButton.x = 154;
	backButton.y = 370;
	
	
	backButton.interactive = true;
	backButton.on('mousedown', function() { controlState("main") } );
	
	creditsC.addChild(backButton);
}

function controlState(state) {
	for(var i = stage.children.length - 1; i >= 0; i--){
		stage.removeChild(stage.children[i]);
	}
	
	gameState = state;
	
	if(gameState === "play") {
		stage.addChild(gameplayC);
		stage.addChild(puzzleC);
	}
	else if(gameState === "main") {
		stage.addChild(mainMenuC);
	}
	else if (gameState === "title"){
		stage.addChild(titleC);
	}
	else if (gameState === "instructions"){
		stage.addChild(instructionsC);
	}
	else if(gameState === "win") {
		stage.addChild(winC);
	}
	
	else if(gameState === "menu") {
		stage.addChild(menuC);
	}
	
	else if(gameState === "credits") {
		stage.addChild(creditsC);
	}
	
}

function animate() {
	requestAnimationFrame(animate);
	handleKeys();
	keepInBounds();
	updateCamera();
	renderer.render(stage);
}

function handleKeys() {
	xMove = 0;
	yMove = 0;
	
	if(hasWon()){
		alert("you win!");
	}
	
	if (allowMovement) {
	
		collision = handleCollision();
		
		if (collision) {
			splash.play();
			allowMovement = false;
			if(character.direction === 0) {
			
			createjs.Tween.get(character.position).to({y: character.position.y - 12}, 450);
			character.boundingSprite.position.y -= 12;
			}
			else if (character.direction === 1) {
				
			createjs.Tween.get(character.position).to({y: character.position.y + 12}, 450);
			character.boundingSprite.position.y += 12;
			}
			else if (character.direction === 2) {
				
			createjs.Tween.get(character.position).to({x: character.position.x + 12}, 450);
			character.boundingSprite.position.x += 12;
			}
			else if (character.direction === 3) {
				
			createjs.Tween.get(character.position).to({x: character.position.x - 12}, 450);
			character.boundingSprite.position.x -= 12;
			}
			setTimeout(function() { allowMovement = true }, 1000 );
		}
			
		else {
		
			// W Key is 87 Up arrow is 38
			if (keysActive[87] || keysActive[38]) {
				character.direction = 1;
				yMove -= character.movement;
			}
		
			// S Key is 83 Down arrow is 40
			else if (keysActive[83] || keysActive[40]) {
				character.direction = 0;
				yMove += character.movement;
			}
		
			// A Key is 65 Left arrow is 37
			if (keysActive[65] || keysActive[37]) {
				character.direction = 2;
				xMove -= character.movement;
			}
		
			// D Key is 68 Right arrow is 39
			else if (keysActive[68] || keysActive[39]) {
				character.direction = 3;
				xMove += character.movement;
			}
			
			if(keysActive[13] && over) {
				window.location.reload();
			}
			
			if(xMove) {
				character.position.x += xMove;
				character.boundingSprite.position.x += xMove;
			}
			else {
				character.position.y += yMove;
				character.boundingSprite.position.y += yMove;
			}
			console.log(character.boundingSprite.position.x + " : " + character.boundingSprite.position.y);
			console.log(character.position.x + " :: " + character.position.y);
		}
	}
}

function updateCamera() {
	stage.x = -character.x * SCALE + WIDTH / 2 - character.width / 2 * SCALE;
	stage.y = -character.y * SCALE + HEIGHT / 2 - character.height / 2 * SCALE;
	stage.x = -Math.max(0, Math.min(world.worldWidth * SCALE - WIDTH, -stage.x));
	stage.y = -Math.max(0, Math.min(world.worldHeight * SCALE - HEIGHT, -stage.y));
}

/**
 *	EnhSprite is just an extension of PIXI.Sprite, keeps track of the name of the sprite as well as collision boolean
 *	Will also contain any further information we need on our Sprites
 */
class EnhSprite extends PIXI.Sprite {
	constructor(name, collides, texture) {
		super(texture)
		super.name = name;
		this.collides = collides;
	}
	
	handleCollision() {
	}
}

/**
 * Player Class - Contains information about the player
 * @param {string} path - path for sprite asset
 * Notable attributes
 * 		Direction (used for weapons + equipment later)
 * 		Movement - speed at which player moves, can be upgraded @ shop later with money collected from dungeons
 *		Coins - amount of money player hasCollided
 */
class Player extends EnhSprite{
	constructor(name, path) {
		super(name, false, new TextureFrame(path) );
		this.direction = 0;
		this.movement = 2;
		this.isClicked = false;
		this.coins = 0;
		this.width = 32;
		this.height = 32;
		
		this.boundingSprite = new EnhSprite("bounds", true, new TextureFrame(path) );
		
		this.boundingSprite.anchor.x = TOP;
		this.boundingSprite.anchor.y = LEFT;
		this.boundingSprite.width = 16;
		this.boundingSprite.height = 16;
		this.boundingSprite.interactive = true;
		
		this.interactive = true;
		this.boundingSprite.visible = false;

		// Anchor player to middle of sprite. Starts at top left of the dungeon (pixel 30+30)
		this.anchor.x = MIDDLE;
		this.anchor.y = MIDDLE;
		this.position.x = 30;
		this.position.y = 30;
		this.boundingSprite.position.x = this.position.x - 8;
		this.boundingSprite.position.y = this.position.y - 8;
	}
}
