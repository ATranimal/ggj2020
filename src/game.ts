import "phaser";

const SCREEN_HEIGHT = 540;
const SCREEN_WIDTH = 960;

let drawerOpen = false;

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("pullup-drawer", "assets/pullup-drawer.png");
    this.load.image("drawer-background", "assets/drawer-background.png");
  }

  create() {
    const drawerGroup = this.add.group();

    const pullupDrawer = drawerGroup
      .create(480, SCREEN_HEIGHT - 8, "pullup-drawer")
      .setInteractive();

    const drawerBackground = drawerGroup.create(
      480,
      SCREEN_HEIGHT + 172,
      "drawer-background"
    );

    pullupDrawer.on("pointerup", pointer => {
      drawerOpen = !drawerOpen;
      drawerGroup.getChildren().forEach(child => {
        this.tweens.add({
          targets: child,
          y: drawerOpen ? "-=344" : "+=344",
          ease: "Power1",
          duration: 120
        });
      });
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
