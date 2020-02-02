import "phaser";

const SCREEN_HEIGHT = 540;
const SCREEN_WIDTH = 960;

let drawerOpen = false;

let drawerContainer;
let cableConnectionGroup;
let cableHoleGroup;

let currentlyDraggedObject;

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
    this.initiateDragListener();
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
      [192, 128, 1],
      [256, 128, 2],
      [192, 192, 3],
      [256, 192, 4],
      [426, 32, 5],
      [426, 94, 6]
    ];

    cableHoleCoords.forEach(coord => {
      let cableHole = cableHoleGroup
        .create(+coord[0], +coord[1], "cable-hole")
        .setInteractive();

      cableHole.setData("holeNumber", coord[2]);

      this.input.setDraggable(cableHole);

      drawerContainer.add(cableHole);
    });

    this.redrawCableConnections(this);

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

  initiateDragListener() {
    this.input.on("dragstart", function(pointer, gameObject) {
      currentlyDraggedObject = gameObject;
    });

    const redrawCables = this.redrawCableConnections;
    const self = this;

    const isHoleConnected = holeNumber =>
      cableHoleConnections.find(connection => connection.includes(holeNumber));

    cableHoleGroup.getChildren().forEach(hole => {
      hole.on("pointerup", function() {
        if (
          currentlyDraggedObject !== null &&
          isHoleConnected(currentlyDraggedObject.getData("holeNumber"))
        ) {
          const oldHoleNumber = currentlyDraggedObject.getData("holeNumber");
          const newHoleNumber = this.getData("holeNumber");

          const oldConnection = cableHoleConnections.find(connection =>
            connection.includes(oldHoleNumber)
          );

          if (
            oldConnection &&
            !(
              oldConnection.includes(oldHoleNumber) &&
              oldConnection.includes(newHoleNumber)
            )
          ) {
            const [existingConnectionHole] = oldConnection.filter(
              hole => hole !== oldHoleNumber
            );

            cableHoleConnections.push([newHoleNumber, existingConnectionHole]);
            cableHoleConnections = cableHoleConnections.filter(
              connection => connection != oldConnection
            );
          }

          redrawCables(self);
        }

        currentlyDraggedObject = null;
      });
    });
  }

  redrawCableConnections(self) {
    cableConnectionGroup.clear(true, true);

    cableHoleConnections.forEach(connection => {
      const arrayOfHoles = cableHoleGroup.getChildren() as Phaser.GameObjects.Sprite[];

      const [startCableHole] = arrayOfHoles.filter(
        hole => hole.getData("holeNumber") == connection[0]
      );
      const [endCableHole] = arrayOfHoles.filter(
        hole => hole.getData("holeNumber") == connection[1]
      );

      let line = self.add.line(
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
