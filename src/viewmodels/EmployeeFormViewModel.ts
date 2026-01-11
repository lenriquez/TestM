import { Employee } from '../models/Employee';
import { apiService, ApiError } from '../services/ApiService';
import { validateSSN, validateFirstName, validateLastName, validateEmployeeNo } from '../utils/validation';

export type EmployeeFormState = 'idle' | 'loading' | 'success' | 'error';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  ssn: string;
  employeeNo: string;
  active: boolean;
}

export interface EmployeeFormErrors {
  firstName?: string;
  lastName?: string;
  ssn?: string;
  employeeNo?: string;
  general?: string;
}

export class EmployeeFormViewModel {
  private _formData: EmployeeFormData = {
    firstName: '',
    lastName: '',
    ssn: '',
    employeeNo: '',
    active: true,
  };
  private _errors: EmployeeFormErrors = {};
  private _state: EmployeeFormState = 'idle';
  private _isEditMode: boolean = false;
  private _employeeId: string | null = null;
  private _listeners: Array<() => void> = [];

  /**
   * Get current form data
   */
  get formData(): EmployeeFormData {
    return { ...this._formData };
  }

  /**
   * Get current errors
   */
  get errors(): EmployeeFormErrors {
    return { ...this._errors };
  }

  /**
   * Get current state
   */
  get state(): EmployeeFormState {
    return this._state;
  }

  /**
   * Check if in edit mode
   */
  get isEditMode(): boolean {
    return this._isEditMode;
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
   * Initialize form for adding new employee
   */
  initializeForAdd(): void {
    this._isEditMode = false;
    this._employeeId = null;
    this._formData = {
      firstName: '',
      lastName: '',
      ssn: '',
      employeeNo: '',
      active: true,
    };
    this._errors = {};
    this._state = 'idle';
    this.notify();
  }

  /**
   * Initialize form for editing existing employee
   */
  async initializeForEdit(employeeId: string): Promise<void> {
    this._isEditMode = true;
    this._employeeId = employeeId;
    this._state = 'loading';
    this._errors = {};
    this.notify();

    try {
      const employee = await apiService.getEmployee(employeeId);
      this._formData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        ssn: employee.ssn,
        employeeNo: employee.employeeNo || '',
        active: employee.active,
      };
      this._state = 'idle';
      this._errors = {};
    } catch (error) {
      this._state = 'error';
      if (error instanceof ApiError) {
        this._errors.general = error.message;
      } else {
        this._errors.general = 'Failed to load employee data. Please try again.';
      }
    } finally {
      this.notify();
    }
  }

  /**
   * Update form field
   */
  updateField<K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]): void {
    this._formData[field] = value;
    // Clear error for this field when user starts typing
    if (this._errors[field as keyof EmployeeFormErrors]) {
      delete this._errors[field as keyof EmployeeFormErrors];
    }
    this.notify();
  }

  /**
   * Validate form
   */
  validate(): boolean {
    this._errors = {};

    const firstNameResult = validateFirstName(this._formData.firstName);
    if (!firstNameResult.isValid) {
      this._errors.firstName = firstNameResult.error;
    }

    const lastNameResult = validateLastName(this._formData.lastName);
    if (!lastNameResult.isValid) {
      this._errors.lastName = lastNameResult.error;
    }

    const ssnResult = validateSSN(this._formData.ssn);
    if (!ssnResult.isValid) {
      this._errors.ssn = ssnResult.error;
    }

    const employeeNoResult = validateEmployeeNo(this._formData.employeeNo);
    if (!employeeNoResult.isValid) {
      this._errors.employeeNo = employeeNoResult.error;
    }

    this.notify();
    return Object.keys(this._errors).length === 0;
  }

  /**
   * Submit form
   */
  async submit(): Promise<boolean> {
    if (!this.validate()) {
      return false;
    }

    this._state = 'loading';
    this._errors = {};
    this.notify();

    try {
      const employeeData: Partial<Employee> = {
        firstName: this._formData.firstName.trim(),
        lastName: this._formData.lastName.trim(),
        ssn: this._formData.ssn.trim(),
        employeeNo: this._formData.employeeNo.trim(),
        active: this._formData.active,
      };

      if (this._isEditMode && this._employeeId) {
        await apiService.updateEmployee(this._employeeId, employeeData);
      } else {
        await apiService.createEmployee(employeeData);
      }

      this._state = 'success';
      this._errors = {};
      this.notify();
      return true;
    } catch (error) {
      this._state = 'error';
      if (error instanceof ApiError) {
        this._errors.general = error.message;
      } else {
        this._errors.general = 'Failed to save employee. Please try again.';
      }
      this.notify();
      return false;
    }
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this._errors = {};
    this.notify();
  }
}
