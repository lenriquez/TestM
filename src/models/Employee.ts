/**
 * Employee data model
 * Maps API response to required UI fields
 */

export interface EmployeeApiResponse {
  PersonID: string;
  FirstName: string;
  LastName: string;
  SSN: string;
  EmployeeNo?: string;
  Status: number; // 0 = Active, other values = Inactive
  EmploymentStartDate?: string;
  EmploymentEndDate?: string | null;
  LastUpdatedBy?: string;
  LastUpdatedDate?: string;
}

export interface Employee {
  id: string; // PersonID from API
  ssn: string;
  firstName: string;
  lastName: string;
  employeeNo?: string; // Employee number
  active: boolean; // Derived from Status (0 = active)
}

/**
 * Transform API response to Employee model
 */
export function fromApiResponse(apiEmployee: EmployeeApiResponse): Employee {
  return {
    id: apiEmployee.PersonID,
    ssn: apiEmployee.SSN,
    firstName: apiEmployee.FirstName,
    lastName: apiEmployee.LastName,
    employeeNo: apiEmployee.EmployeeNo,
    active: apiEmployee.Status === 0,
  };
}

/**
 * Transform Employee model to API request format
 */
export function toApiRequest(employee: Partial<Employee>, existingId?: string): Partial<EmployeeApiResponse> {
  const request: Partial<EmployeeApiResponse> = {};

  if (employee.id || existingId) {
    request.PersonID = employee.id || existingId || '';
  }

  if (employee.firstName !== undefined) {
    request.FirstName = employee.firstName;
  }

  if (employee.lastName !== undefined) {
    request.LastName = employee.lastName;
  }

  if (employee.ssn !== undefined) {
    request.SSN = employee.ssn;
  }

  if (employee.active !== undefined) {
    request.Status = employee.active ? 0 : 1;
  }

  // Add EmployeeNo - required by API
  if (employee.employeeNo !== undefined && employee.employeeNo.trim() !== '') {
    request.EmployeeNo = employee.employeeNo.trim();
  } else {
    // Generate a default employee number if not provided
    const timestamp = Date.now().toString().slice(-8);
    request.EmployeeNo = timestamp.padStart(4, '0');
  }

  // Add EmploymentStartDate - required by API
  if (!request.EmploymentStartDate) {
    request.EmploymentStartDate = new Date().toISOString();
  }

  // Add LastUpdatedBy and LastUpdatedDate for tracking
  request.LastUpdatedBy = 'admin';
  request.LastUpdatedDate = new Date().toISOString();

  return request;
}
