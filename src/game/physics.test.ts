import test from 'node:test';
import assert from 'node:assert/strict';

// Core math and physics logic decoupled from DOM/Three.js
export function calculateVehicleSpeed(
  currentSpeed: number,
  throttle: number,
  brake: number,
  maxSpeed: number,
  acceleration: number,
  brakingPower: number,
  friction: number,
  dt: number
): number {
  let speed = currentSpeed;
  if (throttle > 0) {
    speed += throttle * acceleration * dt;
  }
  if (brake > 0) {
    speed -= brake * brakingPower * dt;
  }
  // Passive rolling resistance / aerodynamic drag
  speed -= speed * friction * dt;
  return Math.max(0, Math.min(speed, maxSpeed));
}

export function calculateSteeringSlip(speed: number, steerInput: number, gripFactor: number): number {
  const normalizedSpeed = Math.min(speed / 100, 1.0);
  const rawSteer = steerInput * (1.0 - normalizedSpeed * 0.45); // Speed-sensitive steering
  const slipAngle = Math.abs(steerInput) * normalizedSpeed * (1.0 - gripFactor);
  return slipAngle;
}

export function shouldTriggerCoyoteJump(
  wasGrounded: boolean,
  isGrounded: boolean,
  timeSinceUngrounded: number,
  coyoteLimit: number,
  jumpBuffered: boolean
): boolean {
  if (isGrounded && jumpBuffered) return true;
  if (!isGrounded && wasGrounded && timeSinceUngrounded <= coyoteLimit && jumpBuffered) return true;
  return false;
}

export function checkDistrictStreaming(
  playerPos: { x: number; z: number },
  districtCenter: { x: number; z: number },
  loadRadius: number
): boolean {
  const dx = playerPos.x - districtCenter.x;
  const dz = playerPos.z - districtCenter.z;
  const distSq = dx * dx + dz * dz;
  return distSq <= loadRadius * loadRadius;
}

// Unit Tests
test('calculateVehicleSpeed accelerates up to max speed', () => {
  let speed = 0;
  const maxSpeed = 160;
  const accel = 40;
  const brake = 0;
  const friction = 0.05;
  const dt = 0.05;

  for (let i = 0; i < 100; i++) {
    speed = calculateVehicleSpeed(speed, 1.0, brake, maxSpeed, accel, 60, friction, dt);
  }
  assert.ok(speed > 50, `Speed ${speed} should have accelerated significantly`);
  assert.ok(speed <= maxSpeed, `Speed ${speed} should not exceed max speed`);
});

test('calculateVehicleSpeed decelerates with brakes applied', () => {
  const initialSpeed = 100;
  const speed = calculateVehicleSpeed(initialSpeed, 0, 1.0, 160, 40, 80, 0.05, 0.1);
  assert.ok(speed < initialSpeed, 'Braking should reduce speed');
});

test('coyote time permits jump within threshold but denies after timeout', () => {
  const valid = shouldTriggerCoyoteJump(true, false, 0.08, 0.12, true);
  assert.equal(valid, true, 'Jump should trigger within coyote window');

  const expired = shouldTriggerCoyoteJump(true, false, 0.15, 0.12, true);
  assert.equal(expired, false, 'Jump should not trigger after coyote window expires');
});

test('district streaming correctly determines proximity threshold', () => {
  const player = { x: 50, z: 50 };
  const districtA = { x: 60, z: 60 };
  const districtB = { x: 300, z: 300 };
  const loadRadius = 150;

  assert.equal(checkDistrictStreaming(player, districtA, loadRadius), true);
  assert.equal(checkDistrictStreaming(player, districtB, loadRadius), false);
});
