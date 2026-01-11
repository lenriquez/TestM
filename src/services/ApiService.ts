import { config } from '../config';
import { Employee, EmployeeApiResponse, fromApiResponse, toApiRequest } from '../models/Employee';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private baseUrl: string;
  private customerId: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.customerId = config.customerId;
    this.apiKey = config.apiKey;
  }

  /**
   * Set API key dynamically
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'CustomerID': this.customerId,
      'APIKey': this.apiKey,
    };
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorData = null;

      try {
        // Clone response to avoid "body already read" error
        const clonedResponse = response.clone();
        errorData = await clonedResponse.json();
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If response is not JSON, try to read as text
        try {
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          if (text) {
            errorMessage = text;
          }
        } catch {
          // If we can't read the body, just use status text
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // For successful responses, check if there's actually content
    // Read as text first to check if body is empty
    const text = await response.text();

    // If body is empty, return empty object
    if (!text || text.trim() === '') {
      return {} as T;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(text) as T;
    } catch {
      // If parsing fails, return empty object
      return {} as T;
    }
  }

  /**
   * Get all employees
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Employees`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // Handle 404 (no employees) by returning empty array
      if (response.status === 404) {
        return [];
      }

      const data = await this.handleResponse<EmployeeApiResponse[]>(response);

      // Handle both array and single object responses
      const employees = Array.isArray(data) ? data : [data];
      return employees.map(fromApiResponse);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<Employee> {
    try {
      const response = await fetch(`${this.baseUrl}/Employees(${id})`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<EmployeeApiResponse>(response);
      return fromApiResponse(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new employee
   */
  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    try {
      // Generate a new UUID for the employee if not provided
      const employeeId = employee.id || this.generateUUID();
      const apiRequest = toApiRequest({ ...employee, id: employeeId });

      const response = await fetch(`${this.baseUrl}/Employees`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(apiRequest),
      });

      const data = await this.handleResponse<EmployeeApiResponse>(response);
      return fromApiResponse(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing employee
   */
  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    try {
      const apiRequest = toApiRequest(employee, id);

      const response = await fetch(`${this.baseUrl}/Employees`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(apiRequest),
      });

      const data = await this.handleResponse<EmployeeApiResponse>(response);
      return fromApiResponse(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/Employees(${id})`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse<void>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
