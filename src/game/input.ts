/**
 * PROJECT NEON CITY - Unified Input Hub
 * Distinguishes continuous held keys from single-frame justPressed edges.
 * Auto-clears on window blur and visibility change.
 */

export class InputManager {
  private heldKeys = new Set<string>();
  private justPressedKeys = new Set<string>();
  private justReleasedKeys = new Set<string>();

  public mouseDeltaX = 0;
  public mouseDeltaY = 0;
  public isPointerLocked = false;
  private pointerLockElement: HTMLElement | null = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const code = e.code.toLowerCase();
      if (!this.heldKeys.has(code)) {
        this.justPressedKeys.add(code);
      }
      this.heldKeys.add(code);

      // Prevent default page scroll on arrow/space/tab
      if (['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code.toLowerCase();
      this.heldKeys.delete(code);
      this.justReleasedKeys.add(code);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });

    // Clear on window blur / tab switch so keys never stick
    window.addEventListener('blur', () => this.clearAllKeys());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clearAllKeys();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.pointerLockElement;
    });
  }

  public setPointerLockTarget(element: HTMLElement) {
    this.pointerLockElement = element;
  }

  public requestPointerLock() {
    if (this.pointerLockElement && document.pointerLockElement !== this.pointerLockElement) {
      try {
        this.pointerLockElement.requestPointerLock();
      } catch {
        // Ignored
      }
    }
  }

  public exitPointerLock() {
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // Ignored
      }
    }
    this.isPointerLocked = false;
  }

  public isHeld(code: string): boolean {
    return this.heldKeys.has(code.toLowerCase());
  }

  public wasJustPressed(code: string): boolean {
    return this.justPressedKeys.has(code.toLowerCase());
  }

  public wasJustReleased(code: string): boolean {
    return this.justReleasedKeys.has(code.toLowerCase());
  }

  /**
   * Consumes a one-shot key press so subsequent checks in the same frame return false
   */
  public consume(code: string): boolean {
    const key = code.toLowerCase();
    if (this.justPressedKeys.has(key)) {
      this.justPressedKeys.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Resets edge triggers and accumulated mouse delta at the end of each frame tick
   */
  public endFrame() {
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  public clearAllKeys() {
    this.heldKeys.clear();
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }
}

export const input = new InputManager();
