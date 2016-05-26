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

// Constants for anchoring sprites
	var LEFT = 0;
	var TOP = 0;
	var MIDDLE = .5;
	var BOTTOM = 1;
	var RIGHT = 1;

// Misc globals used in game
	var player;
	var emptyTile;
	var keysActive;
	var tiles;
	var menu;
	var hasWon;
	var posArr;
	var slide;
	var isAnimating;
	
	var world;
	
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	PIXI.loader
		.add('map.json')
		.add('tileset.png')
		.add('Assets/png/Character-sprite.png')
		.load(setup);

function setup() {
	var tu = new TileUtilities(PIXI);
	world = tu.makeTiledWorld("map.json", "tileset.png");
	stage.addChild(world);
	
	var temp = world.getObject("Player");
	
	player = new Player("Player", "Assets/png/Character-sprite.png");
	var entity_layer = world.getObject("Entities");
	
	entity_layer.addChild(player);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

function update_camera() {
	stage.x = -player.x * SCALE + WIDTH / 2 - player.width / 2 * SCALE;
	stage.y = -player.y * SCALE + HEIGHT / 2 - player.height / 2 * SCALE;
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
