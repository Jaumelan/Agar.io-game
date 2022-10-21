let socket = io.connect("http://localhost:8080");

// this function is called when the user clicks on the start button
function init() {
  draw();
  // call the init event when the client is ready for the data
  socket.emit("init", {
    playerName: player.name,
  });
}

socket.on("initReturn", (data) => {
  //console.log(data.orbs);
  orbs = data.orbs;
  setInterval(() => {
    //console.log(player);
    if (player.xVector) {
      socket.emit("tick", {
        xVector: player.xVector,
        yVector: player.yVector,
      });
    }
  }, 33);
});

socket.on("tock", (data) => {
  players = data.players;
});

socket.on("orbSwitch", (data) => {
  //console.log(data)
  orbs.splice(data.orbIndex, 1, data.newOrb);
});

socket.on("ticktock", (data) => {
  //console.log(data)
  player.locX = data.playerX;
  player.locY = data.playerY;
});

socket.on("updateLeaderBoard", (data) => {
  //console.log(data)
  $(".leader-board").html("");
  data.forEach((curPlayer) => {
    $(".leader-board").append(
      `<li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>`
    );
  });
});
