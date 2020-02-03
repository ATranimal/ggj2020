import "phaser";

const SCREEN_HEIGHT = 540;
const SCREEN_WIDTH = 960;

let beast;

let currentBeastStage = 0;

let drawerOpen = false;
let knobsCorrect = false;
let cablesCorrect = false;
let lightsCorrect = false;

let drawerContainer;
let cableConnectionGroup;
let cableHoleGroup;
let knobGroup;
let lightGroup;

let currentlyDraggedObject;

let cableHoleConnections = [
  [1, 2],
  [4, 6]
];

let nums = [];
while (nums.length < 5) {
  var r = Math.floor(Math.random() * 8) + 1;
  if (nums.indexOf(r) === -1) nums.push(r);
}

let correctCableConnections = [
  [nums[0], nums[1]],
  [nums[2], nums[3]]
];

let correctKnobPositions = [
  Math.floor(Math.random() * 8),
  Math.floor(Math.random() * 8),
  Math.floor(Math.random() * 8),
  Math.floor(Math.random() * 8)
];

let knobSound,
  knob_correct,
  lightSound,
  squish,
  unplug,
  plug_correct,
  plug_wrong;

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("pullup-drawer", "assets/pullup-drawer.png");
    this.load.image("drawer-background", "assets/drawer-background.png");
    this.load.image("cable-hole", "assets/cable-hole.png");
    this.load.image("knob", "assets/knob.png");
    this.load.image("pimple", "assets/pimple.png");
    this.load.image("light", "assets/light.png");

    // Startup Cycle
    for (let i = 1; i < 10; i++) {
      this.load.image(`startup-${i}`, `assets/startup/${i}.png`);
    }

    for (let i = 1; i < 11; i++) {
      this.load.image(`stage1-${i}`, `assets/stage1/${i}.png`);
    }

    for (let i = 0; i < 7; i++) {
      this.load.image(`stage2-${i + 1}`, `assets/stage2/1${i}.png`);
    }

    this.load.audio("bgm", "sounds/ggj2020.mp3");
    this.load.audio("knob", "sounds/knob.mp3");
    this.load.audio("light", "sounds/light.mp3");
    this.load.audio("squish", "sounds/squish.mp3");
    this.load.audio("unplug", "sounds/unplug.mp3");
    this.load.audio("plug_correct", "sounds/plug_correct.mp3");
    this.load.audio("plug_wrong", "sounds/plug_wrong.mp3");
    this.load.audio("knob_correct", "sounds/knob_correct.mp3");

    cableConnectionGroup = this.add.group();
    cableHoleGroup = this.add.group();
    knobGroup = this.add.group();
    lightGroup = this.add.group();
    drawerContainer = this.add.container(SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  }

  create() {
    this.anims.create({
      key: "startup",
      frames: [
        { key: "startup-1", frame: null },
        { key: "startup-2", frame: null },
        { key: "startup-3", frame: null },
        { key: "startup-4", frame: null },
        { key: "startup-5", frame: null },
        { key: "startup-6", frame: null },
        { key: "startup-7", frame: null },
        { key: "startup-8", frame: null },
        { key: "startup-9", frame: null }
      ],
      frameRate: 3,
      repeat: 0
    });

    this.anims.create({
      key: "stage2",
      frames: [
        { key: "stage1-1", frame: null },
        { key: "stage1-2", frame: null },
        { key: "stage1-3", frame: null },
        { key: "stage1-4", frame: null },
        { key: "stage1-5", frame: null },
        { key: "stage1-6", frame: null },
        { key: "stage1-7", frame: null },
        { key: "stage1-8", frame: null },
        { key: "stage1-9", frame: null },
        { key: "stage1-10", frame: null }
      ],
      frameRate: 3,
      repeat: -1,
      yoyo: true
    });

    this.anims.create({
      key: "stage1",
      frames: [
        { key: "stage2-1", frame: null },
        { key: "stage2-2", frame: null },
        { key: "stage2-3", frame: null },
        { key: "stage2-4", frame: null },
        { key: "stage2-5", frame: null },
        { key: "stage2-6", frame: null },
        { key: "stage2-7", frame: null }
      ],
      frameRate: 3,
      repeat: -1,
      yoyo: true
    });

    let music = this.sound.add("bgm", { loop: true, detune: -10 });
    knobSound = this.sound.add("knob");
    knob_correct = this.sound.add("knob_correct");
    lightSound = this.sound.add("light");
    squish = this.sound.add("squish");
    unplug = this.sound.add("unplug");
    plug_correct = this.sound.add("plug_correct");
    plug_wrong = this.sound.add("plug_wrong");
    music.play();

    this.initiateBeast();
    this.initiateDrawer();
    this.initiateDragListener();
  }

  initiateDrawer() {
    const self = this;

    const pullupDrawer = this.add
      .sprite(0, -8, "pullup-drawer")
      .setInteractive()
      .setDepth(2);

    const drawerBackground = this.add
      .sprite(0, 172, "drawer-background")
      .setDepth(2);

    drawerContainer.add(pullupDrawer);
    drawerContainer.add(drawerBackground);

    // Structure: x, y, id, connected, connectedTo
    const cableHoleCoords = [
      [256, 200, 1],
      [312, 200, 2],
      [256, 260, 3],
      [312, 260, 4],
      [426, 32, 5],
      [426, 94, 6],
      [426, 156, 7],
      [426, 218, 8]
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

    const knobCoords = [
      [-312, 120, Math.floor(Math.random() * 5), 0],
      [-200, 120, Math.floor(Math.random() * 6), 1],
      [-368, 240, Math.floor(Math.random() * 6), 2],
      [-256, 240, Math.floor(Math.random() * 6), 3]
    ];

    knobCoords.forEach(coord => {
      const knob = knobGroup
        .create(coord[0], coord[1], "knob")
        .setInteractive();

      knob.setData("direction", coord[2]);
      knob.setData("knobNumber", coord[3]);

      knob.setAngle(coord[2] * 60);

      knob.on("pointerup", function() {
        if (!knobsCorrect) {
          this.setData("direction", (this.getData("direction") + 1) % 6);

          this.setAngle(this.getData("direction") * 60);

          if (
            this.getData("direction") ===
            correctKnobPositions[this.getData("knobNumber")]
          ) {
            knob_correct.play();
          } else {
            knobSound.play();
          }

          self.checkForCorrectKnobs();
        }
      });

      drawerContainer.add(knob);
    });

    const pimple = this.add.sprite(302, 64, "pimple").setInteractive();

    pimple.setData("size", 5);

    pimple.on("pointerup", function() {
      if (this.getData("size") !== 1) {
        squish.play();
        this.setData("size", this.getData("size") - 1);

        this.setScale(this.getData("size") / 5.0);
      } else {
        squish.play();
        self.increaseBeastState();
        this.destroy();
      }
    });

    drawerContainer.add(pimple);

    const lightCoords = [
      [0, 64, true],
      [0, 128, false],
      [0, 192, false],
      [0, 256, true]
    ];

    lightCoords.forEach(coord => {
      const light = lightGroup
        .create(coord[0], coord[1], "light")
        .setInteractive();

      light.setData("isOn", coord[2]);

      if (light.getData("isOn")) {
        light.setTintFill(0xffaaff);
      }

      light.on("pointerup", function() {
        if (!lightsCorrect) {
          this.setData("isOn", !this.getData("isOn"));

          if (this.getData("isOn")) {
            lightSound.play();
            this.setTintFill(0xffaaff);
          } else {
            this.clearTint();
          }

          self.checkForLights();
        }
      });

      drawerContainer.add(light);
    });

    pullupDrawer.on("pointerup", pointer => {
      drawerOpen = !drawerOpen;
      this.tweens.add({
        targets: drawerContainer,
        y: drawerOpen ? "-=344" : "+=344",
        ease: "Power1",
        duration: 600
      });
    });
  }

  initiateDragListener() {
    this.input.on("dragstart", function(pointer, gameObject) {
      currentlyDraggedObject = gameObject;
      unplug.play();
    });

    const redrawCables = this.redrawCableConnections;
    const self = this;

    const isHoleConnected = holeNumber =>
      cableHoleConnections.find(connection => connection.includes(holeNumber));

    cableHoleGroup.getChildren().forEach(hole => {
      hole.on("pointerup", function() {
        if (
          currentlyDraggedObject !== null &&
          isHoleConnected(currentlyDraggedObject.getData("holeNumber")) &&
          !cablesCorrect
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

            const correct = [].concat(...correctCableConnections);
            if (correct.includes(newHoleNumber)) {
              plug_correct.play();
            } else {
              plug_wrong.play();
            }
          }

          redrawCables(self);
          self.checkForCorrectCables();
        }

        currentlyDraggedObject = null;
      });
    });
  }

  initiateBeast() {
    beast = this.add
      .sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "startup-1")
      .setDepth(-1);
  }

  increaseBeastState() {
    currentBeastStage += 1;

    if (currentBeastStage === 1) {
      beast.play("startup");
    } else if (currentBeastStage === 2) {
      beast.play("stage1");
    } else if (currentBeastStage === 3) {
      beast.play("stage2");
    } else if (currentBeastStage === 4) {
      beast.play("escape");
    }

    drawerOpen = !drawerOpen;
    this.tweens.add({
      targets: drawerContainer,
      y: drawerOpen ? "-=344" : "+=344",
      ease: "Power1",
      duration: 600
    });
  }

  checkForCorrectKnobs() {
    const knobs = knobGroup.getChildren();

    if (
      knobs[0].getData("direction") === correctKnobPositions[0] &&
      knobs[1].getData("direction") === correctKnobPositions[1] &&
      knobs[2].getData("direction") === correctKnobPositions[2] &&
      knobs[3].getData("direction") === correctKnobPositions[3]
    ) {
      knobsCorrect = true;
      this.increaseBeastState();
    }
  }

  checkForCorrectCables() {
    const correct = [].concat(...correctCableConnections);
    const current = [].concat(...cableHoleConnections);

    if (
      correct.includes(current[0]) &&
      correct.includes(current[2]) &&
      correct.includes(current[3]) &&
      correct.includes(current[1])
    ) {
      cablesCorrect = true;
      this.increaseBeastState();
    }
  }

  checkForLights() {
    const lights = lightGroup.getChildren();

    let result = true;
    lights.forEach(light => {
      if (!light.getData("isOn")) result = false;
    });

    if (result) {
      lightsCorrect = true;
      this.increaseBeastState();
    }
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
