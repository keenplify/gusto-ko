import currency from "currency.js";

// Define defaults for Philippine Peso
const PHP_DEFAULTS: currency.Options = {
  symbol: "₱", // The Peso sign
  separator: ",", // 1,000
  decimal: ".", // .00
  precision: 2, // 2 decimal places
};

export class MonetaryAmount {
  private readonly _value: currency;

  /**
   * @param amount - The monetary amount (e.g., 10.99 or "10.99")
   * @param options - Optional currency.js configuration (overrides PHP defaults)
   */
  constructor(amount: number | string | currency, options?: currency.Options) {
    // Merge PHP defaults with any user-provided options
    this._value = currency(amount, { ...PHP_DEFAULTS, ...options });
  }

  /**
   * Creates a MonetaryAmount from a database integer (e.g., 1000 -> ₱10.00)
   */
  static fromInteger(
    integerValue: number,
    options?: currency.Options
  ): MonetaryAmount {
    // We pass 'fromCents: true', which the constructor will merge with PHP_DEFAULTS
    return new MonetaryAmount(integerValue, { ...options, fromCents: true });
  }

  /**
   * Returns the integer value for database storage (e.g., ₱10.25 -> 1025)
   */
  toInteger(): number {
    return this._value.intValue;
  }

  /**
   * Returns the formatted string (e.g., "₱1,000.50")
   */
  toString(): string {
    return this._value.format();
  }

  /**
   * Returns the float value (e.g., 10.25).
   */
  toNumber(): number {
    return this._value.value;
  }

  // --- Math Wrappers ---

  add(amount: MonetaryAmount | number): MonetaryAmount {
    return new MonetaryAmount(
      this._value.add(amount instanceof MonetaryAmount ? amount._value : amount)
    );
  }

  subtract(amount: MonetaryAmount | number): MonetaryAmount {
    return new MonetaryAmount(
      this._value.subtract(
        amount instanceof MonetaryAmount ? amount._value : amount
      )
    );
  }

  multiply(number: number): MonetaryAmount {
    return new MonetaryAmount(this._value.multiply(number));
  }

  divide(number: number): MonetaryAmount {
    return new MonetaryAmount(this._value.divide(number));
  }
}
