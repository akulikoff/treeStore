// Полифилы для jsdom окружения
if (typeof globalThis !== 'undefined') {
  // Убеждаемся, что WeakRef доступен
  if (typeof WeakRef === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).WeakRef = class WeakRef<T> {
      constructor(private target: T) {}
      deref(): T | undefined {
        return this.target
      }
    }
  }
  
  // Убеждаемся, что FinalizationRegistry доступен
  if (typeof FinalizationRegistry === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).FinalizationRegistry = class FinalizationRegistry<T> {
      constructor(private callback: (heldValue: T) => void) {}
      register(): void {}
      unregister(): void {}
    }
  }
}
