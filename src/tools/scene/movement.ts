import { Scene, SceneActivationContext } from "excalibur";
import { Player } from '../../player';

// This scene is used for testing character movement
export class Movement extends Scene {
    public onActivate(context: SceneActivationContext) {
      const player = new Player();
      context.engine.add(player);
      
      console.log('added player', player);
    }
}