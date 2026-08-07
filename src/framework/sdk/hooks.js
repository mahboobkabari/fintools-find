/**
 * Platform V3 Lifecycle Hooks Registry
 */

export class CalculatorHooks {
  constructor() {
    this.hooks = {
      beforeCalculate: [],
      afterCalculate: [],
      beforeRender: [],
      afterRender: [],
      beforeShare: [],
    };
  }

  register(event, callback) {
    if (this.hooks[event]) {
      this.hooks[event].push(callback);
    }
  }

  async run(event, context = {}) {
    if (!this.hooks[event]) return context;
    let ctx = { ...context };
    for (const callback of this.hooks[event]) {
      const res = await callback(ctx);
      if (res && typeof res === 'object') {
        ctx = { ...ctx, ...res };
      }
    }
    return ctx;
  }
}
