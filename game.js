// Globals + constants start here. All comments until setup function
	var HEIGHT = 400;
	var WIDTH = 400;
	var SCALE = 1;
	var gameState;

// Aliases
	TextureImage = PIXI.Texture.fromImage;
	TextureFrame = PIXI.Texture.fromFrame;
	Sprite = PIXI.Sprite;
	Container = PIXI.Container;
	Renderer = PIXI.autoDetectRenderer;

// Gameport, renderer, All containers + stage
	var gameport = document.getElementById("gameport");
	var renderer = new Renderer(WIDTH, HEIGHT);
	
	gameport.appendChild(renderer.view);

	var stage = new Container();
	stage.scale.x = SCALE;
	stage.scale.y = SCALE;
	
	var titleC;
	var instructionsC;
	var puzzleC;
	var menuC;
	var creditsC;
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
		.load(setup);

function handleCollision() {
	var hasCollision;
	
	hasCollision = tu.hitTestTile(character, floorData, 39, world, "every");
	
	return hasCollision.hit;
}

function setup() {
	tu = new TileUtilities(PIXI);
	world = tu.makeTiledWorld("map.json", "tileset.png");
	stage.addChild(world);
	
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
	console.log(world.tileheight + " : " + world.tilewidth + " : " + world.widthInTiles);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	handleKeys();
	handleCollision();
	updateCamera();
	renderer.render(stage);
}

function handleKeys() {
	xMove = 0;
	yMove = 0;
	
	if (allowMovement) {
	
		collision = handleCollision();
		
		if (collision) {
			allowMovement = false;
			if(character.direction === 0) {
			createjs.Tween.get(character.position).to({y: character.position.y - 26}, 450);
				//character.position.y -= 26;
			}
			else if (character.direction === 1) {
				
			createjs.Tween.get(character.position).to({y: character.position.y + 44}, 450);
			}
			else if (character.direction === 2) {
				
			createjs.Tween.get(character.position).to({x: character.position.x+44}, 450);
			}
			else if (character.direction === 3) {
				
			createjs.Tween.get(character.position).to({x: character.position.x-16}, 450);
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
				character.scale.x = -1;
				xMove -= character.movement;
			}
		
			// D Key is 68 Right arrow is 39
			else if (keysActive[68] || keysActive[39]) {
				character.direction = 3;
				character.scale.x = 1;
				xMove += character.movement;
			}
			
			if(keysActive[13] && over) {
				window.location.reload();
			}
			
			if(xMove) {
				character.position.x += xMove;
			}
			else {
				character.position.y += yMove;
			}
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

		this.temp = TextureImage(path);
		this.sprite = new EnhSprite("player", true, this.temp);
		this.interactive = true;

		// Anchor player to middle of sprite. Starts at top left of the dungeon (pixel 30+30)
		this.anchor.x = MIDDLE;
		this.anchor.y = MIDDLE;
		this.position.x = 30;
		this.position.y = 30;
	}
}
