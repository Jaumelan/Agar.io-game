/* ===============================
============DRAWING============
=============================== */

function draw() {
  // reset the translation back to default
  context.setTransform(1, 0, 0, 1, 0, 0);

  // clear the screen out
  context.clearRect(0, 0, canvas.width, canvas.height);

  //console.log(player.locX, player.locY)

  // clamp the viewport to the player
  const camX = -player.locX + canvas.width / 2;
  const camY = -player.locY + canvas.height / 2;

  // translate allow us to move around
  context.translate(camX, camY);

  // draw all the players
  players.forEach((p) => {
    context.beginPath();
    context.fillStyle = p.color;

    context.arc(p.locX, p.locY, p.radius, 0, Math.PI * 2);
    //context.arc(200, 200, 10, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = "rgb(0,255,0)";
    context.stroke();
  });
  // draw all the orbs
  orbs.forEach((orb) => {
    context.beginPath();
    context.fillStyle = orb.color;
    context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    context.fill();
  });

  requestAnimationFrame(draw);
}

$(canvas).mousemove((event) => {
  const mousePosition = {
    x: event.clientX,
    y: event.clientY,
  };

  //console.log(mousePosition)

  const angleDeg =
    (Math.atan2(
      mousePosition.y - canvas.height / 2,
      mousePosition.x - canvas.width / 2
    ) *
      180) /
    Math.PI;

  if (angleDeg >= 0 && angleDeg < 90) {
    // console.log("Mouse is in the lower right quad")
    xVector = 1 - angleDeg / 90;
    yVector = -(angleDeg / 90);
  } else if (angleDeg >= 90 && angleDeg <= 180) {
    // console.log("Mouse is in the lower left quad")
    xVector = -(angleDeg - 90) / 90;
    yVector = -(1 - (angleDeg - 90) / 90);
  } else if (angleDeg >= -180 && angleDeg < -90) {
    // console.log("Mouse is in the upper left quad")
    xVector = (angleDeg + 90) / 90;
    yVector = 1 + (angleDeg + 90) / 90;
  } else if (angleDeg < 0 && angleDeg >= -90) {
    // console.log("Mouse is in the upper right quad")
    xVector = (angleDeg + 90) / 90;
    yVector = 1 - (angleDeg + 90) / 90;
  }

  player.xVector = xVector;
  player.yVector = yVector;

  
});
