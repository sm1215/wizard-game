import { Actor, Vector, vec, Color, Rectangle, Line } from "excalibur";
import * as ex from "excalibur";
import { Resources } from "./resources";
import { ControlsComponent } from "./components/input/control";

export class Player extends Actor {
  /**
  * The amount of acceleration to apply to the player when they are walking or running.
  */
  ACCELERATION = 300;

  /**
  * The amount of deceleration to apply to the player when they are stopping (i.e not hold any movement keys)
  */
  STOP_DECELERATION = 600;

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

  get maxVelocity() {
    return this.controls.isRunning ? this.RUN_MAX_VELOCITY : this.WALK_MAX_VELOCITY;
  }

  get isXMovementAllowed() {
    // TODO: add collisions here
    return true;
  }

  get isYMovementAllowed() {
    // TODO: add collisions here
    return true;
  }

  // get playerCenterCoords() {
  //   return vec(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
  // }

  controls = new PlayerControlsComponent();
  sight: PlayerSight;

  constructor() {
    // center the player for now
    const startPos = vec(800 / 2 - 50 / 2, 600 / 2 - 60 / 2);
    super({
      name: 'player',
      pos: startPos,
      width: 50,
      height: 60,
      color: new Color(61, 87, 113, 1)
    });

    console.log('this.pos', this.pos);

    this.addComponent(this.controls);
    this.sight = new PlayerSight(startPos);
    this.addChild(this.sight);
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

    super.update(engine, delta);
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
    // uncomment once prototyping is finished
    this.setFacingDirection();
    const heldXDirection = this.controls.getHeldXDirection();
    const heldYDirection = this.controls.getHeldYDirection();

    // move character and set facing direction
    if (heldXDirection && this.isXMovementAllowed) {
      const direction = heldXDirection === 'Left' ? -1 : 1;
      const accel = this.ACCELERATION * direction;
      this.acc.x += accel;
    }
    if (heldYDirection && this.isYMovementAllowed) {
      const direction = heldYDirection === 'Up' ? -1 : 1;
      const accel = this.ACCELERATION * direction;
      this.acc.y += accel;
    }
  }

  setFacingDirection() {
    const pointerCoords = this.controls.getPointerCoords();
    this.sight.updateRotation(this.pos, pointerCoords);
  }

  applyDeceleration() {
    const isOverMaxXVelocity = Math.abs(this.vel.x) > this.maxVelocity;
    const xDirectionChanged = (
      this.acc.x < 0 && this.vel.x > 0 ||
      this.acc.x > 0 && this.vel.x < 0
    );
    const slowXVelocity = (
      (!this.controls.isXMoving && this.vel.x !== 0) ||
      (xDirectionChanged && this.controls.isXMoving)
    )

    const isOverMaxYVelocity = Math.abs(this.vel.y) > this.maxVelocity;
    const yDirectionChanged = (
      this.acc.y < 0 && this.vel.y > 0 ||
      this.acc.y > 0 && this.vel.y < 0
    );
    const slowYVelocity = (
      (!this.controls.isYMoving && this.vel.y !== 0) ||
      (yDirectionChanged && this.controls.isYMoving)
    )

    // decelerate if we're over the max velocity
    if (isOverMaxXVelocity) {
      this.acc.x = this.maxVelocity * Math.sign(this.vel.x);
    }

    // slow velocity is we're stopping or turning the opposite direction
    if(slowXVelocity) {
      this.acc.x = -this.STOP_DECELERATION * Math.sign(this.vel.x);
    }

    // decelerate if we're over the max velocity
    if (isOverMaxYVelocity) {
      this.acc.y = this.maxVelocity * Math.sign(this.vel.y);
    }

    // slow velocity is we're stopping or turning the opposite direction
    if(slowYVelocity) {
      this.acc.y = -this.STOP_DECELERATION * Math.sign(this.vel.y);
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

// A child actor that represents the direction a player is looking
export class PlayerSight extends Actor {
  line: Line;
  constructor(startPos: Vector) {
    super({
      name: 'playerSight',
      pos: vec(0, 0)
    });
    // need to set the graphics anchor
    // https://github.com/excaliburjs/Excalibur/issues/3117
    this.graphics.anchor = vec(0, 0);

    this.line = this.graphics.use(
      new Line({
        start: vec(0, 0),
        end: vec(100, 0),
        thickness: 2,
        color: new Color(255, 0, 0, 1)
      })
    );

    this.line.origin = vec(0, 0);
  }

  updateRotation(playerCoords: Vector, pointerCoords: Vector) {
    // find difference between x / y coords
    const dx = playerCoords.x - pointerCoords.x;
    const dy = playerCoords.y - pointerCoords.y;

    const theta = Math.atan2(-dy, -dx);
    this.line.rotation = theta;
  }
}