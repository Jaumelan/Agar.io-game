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
let tickSent = false;
let orbs = [];
let players = [];
let settings = {
  defaultOrbs: 50,
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

// issue a message to every connected socket 30 fps
setInterval(() => {
  if (players.length > 0) {
    if (tickSent) {
      //console.log(player.playerData.locX);
      io.to("game").emit("tock", {
        players,
      });
    }
  }
}, 33); // there are 30 33s in 1000 miliseconds, or 1/30th of a second

io.sockets.on("connect", (socket) => {
  let player = {};

  socket.on("init", (data) => {
    // add the player to the game namespace
    socket.join("game");
    // make a playerConfig object
    let playerConfig = new PlayerConfig(settings);
    // make a playerData object
    let playerData = new PlayerData(data.playerName, settings);
    // make a master player object to hold both
    player = new Player(socket.id, playerConfig, playerData);
    //console.log(player)

    // issue a message to every connected socket 30 fps
    setInterval(() => {
      //console.log(player.playerData.locX);
      // issue a message to This client with it's loc 30/sec

      socket.emit("ticktock", {
        playerX: player.playerData.locX,
        playerY: player.playerData.locY,
      });
    }, 33); // there are 30 33s in 1000 miliseconds, or 1/30th of a second

    socket.emit("initReturn", {
      orbs,
    });

    players.push(playerData);
  });

  // the client sent over a tick. that means that we know what direction to move the socket
  socket.on("tick", (data) => {
    tickSent = true;
    if (data.xVector && data.yVector) {
      let speed = player.playerConfig.speed;

      // update the playerConfig with the new direction in data
      // and at the same time create a local variable for this callback for readability
      player.playerConfig.xVector = data.xVector;
      player.playerConfig.yVector = data.yVector;
      let xV = player.playerConfig.xVector;
      let yV = player.playerConfig.yVector;

      //console.log(player.playerData.locX < 5 && player.playerData.xVector < 0)
      if (
        (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
        (player.playerData.locX > settings.worldWidth && xV > 0)
      ) {
        player.playerData.locY -= speed * yV;
        //console.log(player.playerData.locY);
      } else if (
        (player.playerData.locY < 5 && yV > 0) ||
        (player.playerData.locY > settings.worldHeight && yV < 0)
      ) {
        player.playerData.locX += speed * xV;
      } else {
        player.playerData.locX += speed * xV;
        player.playerData.locY -= speed * yV;
      }

      //console.log(player.playerData.locX)
      let capturedOrb = checkForOrbCollisions(
        player.playerData,
        player.playerConfig,
        orbs,
        settings
      );

      capturedOrb
        .then((data) => {
          //then runs if resolve runs => a collision happened
          //console.log(`Orb collision at ${data}`)
          const orbData = {
            orbIndex: data,
            newOrb: orbs[data],
          };
          io.sockets.emit("orbSwitch", orbData);
          // Every socket needs to know the leaderBoard has changed
          io.sockets.emit("updateLeaderBoard", getLeaderBoard());
        })
        .catch(() => {
          //catch runs if the reject runs => no collisions
          //console.log("No orb collision")
        });

      // PLAYER COLLISION
      let playerDeath = checkForPlayerCollisions(
        player.playerData,
        player.playerConfig,
        players,
        player.socketId
      );

      playerDeath
        .then((data) => {
          //console.log("collision");

          // Every socket needs to know the leaderBoard has changed
          io.sockets.emit("updateLeaderBoard", getLeaderBoard());
        })
        .catch(() => {});
    }
  });
});

function getLeaderBoard() {
  // sort players in desc order
  players.sort((a, b) => b.score - a.score);

  const leaderBoard = players.map((curPlayer) => {
    return {
      name: curPlayer.name,
      score: curPlayer.score,
    };
  });

  return leaderBoard;
}

module.exports = io;
