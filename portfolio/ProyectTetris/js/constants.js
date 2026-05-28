"use strict";

const TESTING = !true;
const FLIP_BOARD = !true;
const CORNER_CUBES = !true;

const FLOOR_TEXTURE_PATH = "img/fondotetris.jpg";
const CUBE_TEXTURE_PATH = "img/caratetris.png";

const ADD_GRID_HELPER = !true;
const ADD_AXIS_HELPER = !true;

const CUBE_SIZE = 85;


const FLOOR_SIZE_MULTIPLIER = 1.25;

const FLOOR_THICKNESS = 35;


const BOARD_SIZE = 14;

const BOARD_HEIGHT = 20;
const DEFAULT_BOARD = 0;

const ROTATION_AMOUNT = 0.05;
const MINIMUM_SPEED_MODIFIER = 0.1;

var camera_y;
var camera_x;
var camera_z;

if (TESTING) {
  camera_y = 750;
  camera_x = 1450;
  camera_z = 1450;
} else {
  camera_y = 1650;
  camera_x = 2300;
  camera_z = 2300;
}

if (FLIP_BOARD) {
  camera_x *= -1;
  camera_z *= -1;
}

const CAMERA_Y = camera_y;
const CAMERA_X = camera_x;
const CAMERA_Z = camera_z;

const CAMERA_POINT_Y = Math.floor(CAMERA_Y / 2);
const CAMERA_POINT_X = 0;
const CAMERA_POINT_Z = 0;