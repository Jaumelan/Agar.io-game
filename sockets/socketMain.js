const io = require("../server").io;
const Orb = require("./classes/Orb");
const checkForOrbCollisions =
  require("./checkCollisions").checkForOrbCollisions;
const checkForPlayerCollisions =
  require("./checkCollisions").checkForPlayerCollisions;

/*===================================
=============CLASSES=================
===================================*/

const Player = require("./classes/Player");
const PlayerConfig = require("./classes/PlayerConfig");
const PlayerData = require("./classes/PlayerData");

let orbs = [];
let players = [];
let settings = {
  defaultOrbs: 500,
  defaultSpeed: 6,
  defaultSize: 6,
  //as a player gets bigger, the zoom needs to go out
  defaultZoom: 1.5,
  worldWidth: 500,
  worldHeight: 500,
};

// Run at the beginning of a new game
function initGame() {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

initGame();

io.sockets.on("connect", (socket) => {
  let player = {};
  player.tickSent = false;
  socket.on("init", (data) => {
    // add the player to the game namespace
    socket.join("game");
    // make a playerConfig object
    let playerConfig = new PlayerConfig(settings);
    // make a playerData object
    let playerData = new PlayerData(data.playerName, settings);
    // make a master player object to hold both
    player = new Player(socket.id, playerConfig, playerData);

    // issue a message to every connected socket 30 fps
    setInterval(() => {
      if (player.tickSent) {
        //console.log(player.playerData.locX);
        io.to("game").emit("tock", {
          players,
          playerX: player.playerData.locX,
          playerY: player.playerData.locY,
        });
      }
    }, 33); // there are 30 33s in 1000 miliseconds, or 1/30th of a second

    socket.emit("initReturn", {
      orbs,
    });

    players.push(playerData);
  });

  // the client sent over a tick. that means that we know what direction to move the socket
  socket.on("tick", (data) => {
    player.tickSent = true;
    let speed = player.playerConfig.speed;

    // update the playerConfig with the new direction in data
    // and at the same time create a local variable for this callback for readability
    let xV = (player.playerConfig.xVector = data.xVector);
    let yV = (player.playerConfig.yVector = data.yVector);

    if (
      (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
      (player.playerData.locX > 500 && xV > 0)
    ) {
      player.playerData.locY -= speed * yV;
    } else if (
      (player.playerData.locY < 5 && yV > 0) ||
      (player.playerData.locY > 500 && yV < 0)
    ) {
      player.playerData.locX += speed * xV;
    } else {
      player.playerData.locX += speed * xV;
      player.playerData.locY -= speed * yV;
    }
  });
});

module.exports = io;
