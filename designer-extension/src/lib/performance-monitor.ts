// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark performance timing
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  }

  // Measure performance between two marks
  measure(name: string, startMark: string, endMark: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        const duration = measure.duration;
        this.metrics.set(name, duration);
        return duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  }

  // Get performance metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // Report Core Web Vitals
  reportWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Report LCP - Only run in browser
    if (typeof window !== "undefined" && 'PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries && entries.length > 0 ? entries[entries.length - 1] : null;
        if (lastEntry) {
          this.metrics.set('LCP', lastEntry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Report FID - Only run in browser
    if (typeof window !== "undefined" && 'PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        (entries || []).forEach((entry) => {
          this.metrics.set('FID', (entry as any).processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
    }

    // Report CLS - Only run in browser
    if (typeof window !== "undefined" && 'PerformanceObserver' in window) {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        (entries || []).forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.metrics.set('CLS', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
