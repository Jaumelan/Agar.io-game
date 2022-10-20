let wHeigth = $(window).height();
let wWidth = $(window).width();
let player = {};
let orbs = [];
let players = [];


let canvas = document.querySelector("#the-canvas");
let context = canvas.getContext("2d");
canvas.width = wWidth;
canvas.height = wHeigth;

$(window).load(() => {
  $("#loginModal").modal("show");
});

$(".name-form").submit((event) => {
  event.preventDefault();
  player.name = $("#name-input").val();
  //console.log(player.name);
  $("#loginModal").modal("hide");
  $("#spawnModal").modal("show");
  $(".player-name").html(player.name);
});

$(".start-game").click((event) => {
  $(".modal").modal("hide");
  $(".hiddenOnStart").removeAttr("hidden");
  init();
});
