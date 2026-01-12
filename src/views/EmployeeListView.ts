import { EmployeeListViewModel } from '../viewmodels/EmployeeListViewModel';
import { router } from '../utils/router';
import { ModalService } from '../utils/ModalService';

export class EmployeeListView {
  private viewModel: EmployeeListViewModel;
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor(viewModel: EmployeeListViewModel, container: HTMLElement) {
    this.viewModel = viewModel;
    this.container = container;
  }

  /**
   * Render the view
   */
  render(): void {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
    this.subscribeToViewModel();
  }

  /**
   * Get header HTML template
   */
  private getHeaderTemplate(disableButton: boolean = false): string {
    const disabledAttr = disableButton ? ' disabled' : '';
    return `
      <div class="header">
        <h1>Employees</h1>
        <button class="btn btn-primary" id="add-employee-btn"${disabledAttr}>New Employee</button>
      </div>
    `;
  }

  /**
   * Get HTML template
   */
  private getTemplate(): string {
    const { employees, state, error } = this.viewModel;

    if (state === 'loading') {
      return `
        <div class="employee-list-container">
          ${this.getHeaderTemplate(true)}
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading employees...</p>
          </div>
        </div>
      `;
    }

    if (state === 'error') {
      return `
        <div class="employee-list-container">
          ${this.getHeaderTemplate()}
          <div class="error-container">
            <p class="error-message">${error || 'An error occurred'}</p>
            <button class="btn btn-secondary" id="retry-btn">Retry</button>
          </div>
        </div>
      `;
    }

    if (employees.length === 0) {
      return `
        <div class="employee-list-container">
          ${this.getHeaderTemplate()}
          <div class="empty-state">
            <p>No employees found. Click "New Employee" to get started.</p>
          </div>
        </div>
      `;
    }

    const tableRows = employees.map(employee => `
      <tr>
        <td>${this.escapeHtml(employee.id)}</td>
        <td>${this.escapeHtml(employee.ssn)}</td>
        <td>${this.escapeHtml(employee.firstName)}</td>
        <td>${this.escapeHtml(employee.lastName)}</td>
        <td>
          <span class="status-badge ${employee.active ? 'active' : 'inactive'}">
            ${employee.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="actions">
          <i class="fa-regular fa-pen-to-square action-icon action-edit" data-action="edit" data-id="${this.escapeHtml(employee.id)}" title="Edit"></i>
          <i class="fa-regular fa-trash-can action-icon action-delete" data-action="delete" data-id="${this.escapeHtml(employee.id)}" data-employee-name="${this.escapeHtml(employee.firstName + ' ' + employee.lastName)}" title="Delete"></i>
        </td>
      </tr>
    `).join('');

    return `
      <div class="employee-list-container">
        ${this.getHeaderTemplate()}
        <div class="table-container">
          <table class="employee-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SSN</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // New employee button
    const addBtn = this.container.querySelector('#add-employee-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        router.navigate('/add');
      });
    }

    // Retry button
    const retryBtn = this.container.querySelector('#retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.viewModel.loadEmployees();
      });
    }

    // Edit icons and Delete icons
    const actionElements = this.container.querySelectorAll('[data-action]');
    actionElements.forEach(element => {
      element.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const action = target.getAttribute('data-action');
        const id = target.getAttribute('data-id');

        if (!id) return;

        if (action === 'edit') {
          router.navigate(`/edit/${id}`);
        } else if (action === 'delete') {
          // Get employee name for display
          const employeeName = target.getAttribute('data-employee-name') || 'this employee';

          // Show delete confirmation modal
          ModalService.showDeleteConfirmation(employeeName, async () => {
            await this.viewModel.deleteEmployee(id);
            // View will update automatically via subscription
          }).catch(() => {
            // User cancelled - do nothing
          });
        }
      });
    });
  }

  /**
   * Subscribe to view model changes
   */
  private subscribeToViewModel(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.viewModel.subscribe(() => {
      this.render();
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
