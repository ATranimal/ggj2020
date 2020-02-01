import "phaser";

const SCREEN_HEIGHT = 540;
const SCREEN_WIDTH = 960;

let drawerOpen = false;

let drawerContainer;
let cableConnectionGroup;
let cableHoleGroup;

let cableHoleConnections = [
  [1, 2],
  [4, 6]
];

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("pullup-drawer", "assets/pullup-drawer.png");
    this.load.image("drawer-background", "assets/drawer-background.png");
    this.load.image("cable-hole", "assets/cable-hole.png");

    cableConnectionGroup = this.add.group();
    cableHoleGroup = this.add.group();
    drawerContainer = this.add.container(SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  }

  create() {
    this.initiateDrawer();
  }

  initiateDrawer() {
    const pullupDrawer = this.add
      .sprite(0, -8, "pullup-drawer")
      .setInteractive();

    const drawerBackground = this.add.sprite(0, 172, "drawer-background");

    drawerContainer.add(pullupDrawer);
    drawerContainer.add(drawerBackground);

    // Structure: x, y, id, connected, connectedTo
    const cableHoleCoords = [
      [56, 128, 1, true, 2],
      [128, 128, 2, true, 1],
      [56, 192, 3, false, undefined],
      [128, 192, 4, true, 6],
      [256, 32, 5, false, undefined],
      [256, 94, 6, true, 4]
    ];

    cableHoleCoords.forEach(coord => {
      let cableHole = cableHoleGroup
        .create(+coord[0], +coord[1], "cable-hole")
        .setInteractive();

      cableHole.setData("holeNumber", coord[2]);
      cableHole.setData("isConnected", coord[3]);
      cableHole.setData("connectedTo", coord[4]);

      cableHole.on("pointerup", function(pointer, x, y, event) {
        cableHole.setData("isConnected", !cableHole.getData("isConnected"));
      });

      if (cableHole.getData("isConnected")) {
        cableHole.setTint(50);
      }

      drawerContainer.add(cableHole);
    });

    this.redrawCableConnections();

    pullupDrawer.on("pointerup", pointer => {
      drawerOpen = !drawerOpen;
      this.tweens.add({
        targets: drawerContainer,
        y: drawerOpen ? "-=344" : "+=344",
        ease: "Power1",
        duration: 120
      });
    });
  }

  redrawCableConnections() {
    cableConnectionGroup.getChildren().forEach(function(connection) {
      connection.destroy();
    });

    cableHoleConnections.forEach(connection => {
      const arrayOfHoles = cableHoleGroup.getChildren() as Phaser.GameObjects.Sprite[];

      const [startCableHole] = arrayOfHoles.filter(
        hole => hole.getData("holeNumber") == connection[0]
      );
      const [endCableHole] = arrayOfHoles.filter(
        hole => hole.getData("holeNumber") == connection[1]
      );

      let line = this.add.line(
        startCableHole.x,
        startCableHole.y,
        0,
        0,
        endCableHole.x - startCableHole.x,
        endCableHole.y - startCableHole.y,
        0x000000,
        1
      );

      line.setOrigin(0);

      cableConnectionGroup.add(line);
      drawerContainer.add(line);
    });
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scene: Demo
};

const game = new Phaser.Game(config);
