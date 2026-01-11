/**
 * Simple hash-based router for SPA navigation
 */

export type RouteHandler = (params?: Record<string, string>) => void;

export interface Route {
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentRoute: string = '';

  constructor() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Handle initial route
    this.handleRoute();
  }

  /**
   * Register a route
   */
  on(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a route
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Get current route
   */
  getCurrentRoute(): string {
    return this.currentRoute;
  }

  /**
   * Handle route change
   */
  private handleRoute(): void {
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = hash;

    // Try exact match first
    if (this.routes.has(hash)) {
      const handler = this.routes.get(hash);
      if (handler) {
        handler();
        return;
      }
    }

    // Try pattern matching (e.g., /edit/:id)
    for (const [routePath, handler] of this.routes.entries()) {
      const params = this.matchRoute(routePath, hash);
      if (params !== null) {
        handler(params);
        return;
      }
    }

    // Default to list if no match
    if (this.routes.has('/')) {
      const handler = this.routes.get('/');
      if (handler) {
        handler();
      }
    }
  }

  /**
   * Match route pattern with actual path
   * Returns params object if match, null otherwise
   */
  private matchRoute(pattern: string, path: string): Record<string, string> | null {
    // Filter out empty strings from split (removes leading/trailing empty parts)
    const patternParts = pattern.split('/').filter(part => part !== '');
    const pathParts = path.split('/').filter(part => part !== '');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (!patternPart || !pathPart) {
        return null;
      }

      if (patternPart.startsWith(':')) {
        // It's a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Exact match required
        return null;
      }
    }

    return params;
  }
}

// Export singleton instance
export const router = new Router();
