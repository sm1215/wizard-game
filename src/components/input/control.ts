import { Component, Entity, Keys } from "excalibur";

export class ControlsComponent extends Component {
  declare owner: Entity;

  type = 'input';

  controls = {
    Left: Keys.A,
    Right: Keys.D,
    Up: Keys.W,
    Down: Keys.S,
    Jump: Keys.Space,
    Run: Keys.ShiftLeft,

  } as const;

  isHeld(control: keyof typeof this.controls) {
    const engine = this.owner.scene!.engine;
    const key = this.controls[control];

    return engine.input.keyboard.isHeld(key);
  }

  wasPressed(control: keyof typeof this.controls) {
    const engine = this.owner.scene!.engine;
    const key = this.controls[control];

    return engine.input.keyboard.wasPressed(key);
  }

  wasReleased(control: keyof typeof this.controls) {
    const engine = this.owner.scene!.engine;
    const key = this.controls[control];

    return engine.input.keyboard.wasReleased(key);
  }

  /**
   * Returns the latest of the Left or Right keys that was pressed. Helpful for
   * keyboard controls where both keys may be pressed at the same time if you
   * want to prioritize one over the other.
   */
  getHeldXDirection(): 'Left' | 'Right' | undefined {
    const engine = this.owner.scene!.engine;

    for (const key of engine.input.keyboard.getKeys().slice().reverse()) {
      if (this.controls.Left.includes(key as any)) return 'Left';
      if (this.controls.Right.includes(key as any)) return 'Right';
    }
  }

  getHeldYDirection(): 'Up' | 'Down' | undefined {
    const engine = this.owner.scene!.engine;

    for (const key of engine.input.keyboard.getKeys().slice().reverse()) {
      if (this.controls.Up.includes(key as any)) return 'Up';
      if (this.controls.Down.includes(key as any)) return 'Down';
    }
  }

  getPointerCoords() {
    const engine = this.owner.scene!.engine;
    const pointer = engine.input.pointers.primary;

    // Options:
    // lastPagePos
    // lastScreenPos
    // lastWorldPos
    // For simplicity, going to use lastWorldPos for now and see how that works out
    // console.log('pointer', pointer);
    return pointer.lastWorldPos;
  }
}
