import { Engine, Color } from "excalibur";
import { Player } from "./player";
import { loader } from "./resources";
import { Movement } from './tools/scene/movement';

class Game extends Engine {
    constructor() {
      super({
        width: 800,
        height: 600,
        pixelArt: true,
        backgroundColor: new Color(255, 255, 255),
        scenes: {
          movement: {
            scene: Movement
          }
        }
      });
    }
    initialize() {
      const player = new Player();
      this.add(player);
      this.start(loader).then(() => {
        this.goToScene('movement');
      });
    }
  }
  
  export const game = new Game();
  game.initialize();