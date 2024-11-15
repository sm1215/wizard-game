import { Actor, vec, Color } from "excalibur";
import { Resources } from "./resources";
import { ControlsComponent } from "./components/input/control";


interface Facing {
  x: null | string,
  y: null | string
};
export class Player extends Actor {
  /**
  * The amount of acceleration to apply to the player when they are walking or running.
  */
  ACCELERATION = 300;

  /**
  * The amount of deceleration to apply to the player when they are stopping (i.e not hold any movement keys)
  */
  STOP_DECELERATION = this.ACCELERATION;

  /**
  * The amount of time the player must be running before they can sprint.
  */
  SPRINT_TRIGGER_TIME = 1000;

  /**
  * The maximum velocity the player can walk at.
  */
  WALK_MAX_VELOCITY = 200;

  /**
  * The maximum velocity the player can run at.
  */
  RUN_MAX_VELOCITY = 400;

  /**
  * The direction the player is facing.
  */
  facing: Facing = {
    x: 'right',
    y: null
  };

  get maxVelocity() {
    return this.controls.isRunning ? this.RUN_MAX_VELOCITY : this.WALK_MAX_VELOCITY;
  }

  controls = new PlayerControlsComponent();

  get isXMovementAllowed() {
    // TODO: add collisions here
    return true;
  }

  get isYMovementAllowed() {
    // TODO: add collisions here
    return true;
  }

  constructor() {
    super({
      name: 'player',
      pos: vec(150, 150),
      width: 50,
      height: 60,
      color: new Color(61, 87, 113, 1)
    });

    this.addComponent(this.controls);
  }

  onInitialize() {
    // TODO: add character sprite after controls are finished
    // this.graphics.add(Resources.Sword.toSprite());
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.handleInput(engine, delta);
  }

  update(engine: ex.Engine<any>, delta: number): void {
    // reset acceleration
    this.acc.x = 0;
    this.acc.y = 0;

    super.update(engine, delta)
  }

  onPostUpdate(engine: ex.Engine, delta: number): void {
    // // speed up the animation the faster we're moving
    // this.animation.speed = Math.min(
    //   // increase anim speed exponentially up to 3x
    //   1 + Math.pow(Math.abs(this.vel.x) / 200, 2) * 3,
    //   3
    // )

    // this.handleAnimation()
    this.applyDeceleration();
  }

  /**
  * Process user input to control the character
  */
  handleInput(engine: ex.Engine, delta: number) {
    const heldXDirection = this.controls.getHeldXDirection();
    const heldYDirection = this.controls.getHeldYDirection();

    this.facing = {
      x: null,
      y: null
    }

    // move character and set facing direction
    if (heldXDirection && this.isXMovementAllowed) {
      const direction = heldXDirection === 'Left' ? -1 : 1;
      const accel = this.ACCELERATION * direction;

      this.facing.x = direction === -1 ? 'left' : 'right';
      this.acc.x += accel;
    }
    if (heldYDirection && this.isYMovementAllowed) {
      const direction = heldYDirection === 'Up' ? -1 : 1;
      const accel = this.ACCELERATION * direction;

      this.facing.y = direction === -1 ? 'up' : 'down';
      this.acc.y += accel;
    }
  }

  applyDeceleration() {
    const isOverMaxXVelocity = Math.abs(this.vel.x) > this.maxVelocity;
    const isOverMaxYVelocity = Math.abs(this.vel.y) > this.maxVelocity;

    // decelerate if we're over the max velocity or stopped walking
    if (!this.controls.isXMoving || isOverMaxXVelocity) {
      if (this.vel.x !== 0) {
        this.acc.x = -this.STOP_DECELERATION * Math.sign(this.vel.x);
      }
    }
    if (!this.controls.isYMoving || isOverMaxYVelocity) {
      if (this.vel.y !== 0) {
        this.acc.y = -this.STOP_DECELERATION * Math.sign(this.vel.y);
      }
    }

    const isXDecelerating = (
      Math.sign(this.vel.x) !== 0 &&
      Math.sign(this.vel.x) !== Math.sign(this.acc.x)
    );
    const isYDecelerating = (
      Math.sign(this.vel.y) !== 0 &&
      Math.sign(this.vel.y) !== Math.sign(this.acc.y)
    );
    // clamp to 0 if we're close enough
    if (isXDecelerating && Math.abs(this.vel.x) < 1) {
      this.vel.x = 0;
      this.acc.x = 0;
    }
    if (isYDecelerating && Math.abs(this.vel.y) < 1) {
      this.vel.y = 0;
      this.acc.y = 0;
    }
  }
}

/**
 * Handles user input for the player, adding some extra helper methods
 * to get the intent of movement via input.
 *
 * For example, `isMoving` returns true if the player is holding left or right, but
 * does not necessarily mean the player is actually moving.
 */
class PlayerControlsComponent extends ControlsComponent {
  declare owner: Player;
  sprintTimer = 0;

  onAdd(owner: Player): void {
    super.onAdd?.(owner);
  }

  get isXMoving() {
    return this.getHeldXDirection() !== undefined;
  }

  get isYMoving() {
    return this.getHeldYDirection() !== undefined;
  }

  get isRunning() {
    return (
      this.isXMoving ||
      this.isYMoving
    ) && this.isHeld('Run');
  }
}