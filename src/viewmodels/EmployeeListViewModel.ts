import { Employee } from '../models/Employee';
import { apiService, ApiError } from '../services/ApiService';

export type EmployeeListState = 'loading' | 'loaded' | 'error';

export class EmployeeListViewModel {
  private _employees: Employee[] = [];
  private _state: EmployeeListState = 'loading';
  private _error: string | null = null;
  private _listeners: Array<() => void> = [];

  /**
   * Get current employees list
   */
  get employees(): Employee[] {
    return this._employees;
  }

  /**
   * Get current state
   */
  get state(): EmployeeListState {
    return this._state;
  }

  /**
   * Get current error message
   */
  get error(): string | null {
    return this._error;
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of changes
   */
  private notify(): void {
    this._listeners.forEach(listener => listener());
  }

  /**
   * Load all employees
   */
  async loadEmployees(): Promise<void> {
    this._state = 'loading';
    this._error = null;
    this.notify();

    try {
      this._employees = await apiService.getAllEmployees();
      this._state = 'loaded';
      this._error = null;
    } catch (error) {
      this._state = 'error';
      if (error instanceof ApiError) {
        this._error = error.message;
      } else {
        this._error = 'Failed to load employees. Please try again.';
      }
      this._employees = [];
    } finally {
      this.notify();
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<boolean> {
    try {
      await apiService.deleteEmployee(id);
      // Reload the list after deletion
      await this.loadEmployees();
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        this._error = error.message;
      } else {
        this._error = 'Failed to delete employee. Please try again.';
      }
      this.notify();
      return false;
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error = null;
    this.notify();
  }
}
