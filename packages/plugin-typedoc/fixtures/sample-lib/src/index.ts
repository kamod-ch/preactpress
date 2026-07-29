/**
 * Supported math operations.
 * @since 1.0.0
 */
export enum Operation {
  /** Add values */
  Add = "add",
  /** Multiply values */
  Multiply = "multiply",
}

/**
 * Generic numeric result wrapper.
 */
export interface Result<T extends number = number> {
  value: T;
  operation: Operation;
}

/**
 * Adds two numbers.
 * @param left - First summand
 * @param right - Second summand
 * @returns The sum
 * @example
 * ```ts
 * add(2, 3) // 5
 * ```
 */
export function add(left: number, right: number): number {
  return left + right;
}

/**
 * Calculator with chainable operations.
 * @deprecated Use plain functions instead.
 */
export class Calculator {
  /** Current numeric value */
  readonly value: number;

  /** @param initial - Starting value */
  constructor(initial = 0) {
    this.value = initial;
  }

  /**
   * Adds a number to the current value.
   * @param amount - Amount to add
   */
  add(amount: number): Calculator {
    return new Calculator(this.value + amount);
  }

  private secret(): number {
    return this.value * 2;
  }
}

/** Alias for numeric identifiers. */
export type NumericId = number;

/** @internal */
export function hiddenHelper(): void {}
