import { EmployeeFormViewModel } from '../viewmodels/EmployeeFormViewModel';
import { router } from '../utils/router';
import { formatSSN } from '../utils/validation';

export class EmployeeFormView {
  private viewModel: EmployeeFormViewModel;
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor(viewModel: EmployeeFormViewModel, container: HTMLElement) {
    this.viewModel = viewModel;
    this.container = container;
  }

  /**
   * Render the view
   */
  render(): void {
    // Store the currently focused element before re-rendering
    const activeElement = document.activeElement;
    const activeElementId = activeElement instanceof HTMLElement ? activeElement.id : null;
    const activeElementSelectionStart = activeElement instanceof HTMLInputElement
      ? activeElement.selectionStart
      : null;
    const activeElementSelectionEnd = activeElement instanceof HTMLInputElement
      ? activeElement.selectionEnd
      : null;

    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
    this.subscribeToViewModel();
    this.updateFormFields();

    // Restore focus and cursor position if an input was focused
    if (activeElementId) {
      const restoredElement = this.container.querySelector(`#${activeElementId}`) as HTMLInputElement;
      if (restoredElement) {
        restoredElement.focus();
        // Restore cursor position for text inputs
        if (restoredElement instanceof HTMLInputElement &&
          activeElementSelectionStart !== null &&
          activeElementSelectionEnd !== null) {
          restoredElement.setSelectionRange(activeElementSelectionStart, activeElementSelectionEnd);
        }
      }
    }
  }

  /**
   * Get HTML template
   */
  private getTemplate(): string {
    const { isEditMode, state, formData, errors } = this.viewModel;
    const title = isEditMode ? 'Edit Employee' : 'Add New Employee';
    const submitLabel = state === 'loading' ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Create Employee');

    return `
      <div class="employee-form-container">
        <div class="header">
          <h1>${this.escapeHtml(title)}</h1>
          <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
        </div>
        
        ${errors.general ? `
          <div class="error-banner">
            <p class="error-message">${this.escapeHtml(errors.general)}</p>
          </div>
        ` : ''}

        <form id="employee-form" class="employee-form">
          <div class="form-group">
            <label for="employeeNo">Employee Number <span class="required">*</span></label>
            <input 
              type="text" 
              id="employeeNo" 
              name="employeeNo" 
              value="${this.escapeHtml(formData.employeeNo)}"
              class="form-input ${errors.employeeNo ? 'error' : ''}"
              placeholder="e.g., 0001"
              maxlength="20"
              required
            />
            ${errors.employeeNo ? `<span class="error-text">${this.escapeHtml(errors.employeeNo)}</span>` : ''}
          </div>

          <div class="form-group">
            <label for="firstName">First Name <span class="required">*</span></label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              value="${this.escapeHtml(formData.firstName)}"
              class="form-input ${errors.firstName ? 'error' : ''}"
              required
            />
            ${errors.firstName ? `<span class="error-text">${this.escapeHtml(errors.firstName)}</span>` : ''}
          </div>

          <div class="form-group">
            <label for="lastName">Last Name <span class="required">*</span></label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              value="${this.escapeHtml(formData.lastName)}"
              class="form-input ${errors.lastName ? 'error' : ''}"
              required
            />
            ${errors.lastName ? `<span class="error-text">${this.escapeHtml(errors.lastName)}</span>` : ''}
          </div>

          <div class="form-group">
            <label for="ssn">SSN <span class="required">*</span></label>
            <input 
              type="text" 
              id="ssn" 
              name="ssn" 
              value="${this.escapeHtml(formData.ssn)}"
              class="form-input ${errors.ssn ? 'error' : ''}"
              placeholder="XXX-XX-XXXX"
              maxlength="11"
              required
            />
            ${errors.ssn ? `<span class="error-text">${this.escapeHtml(errors.ssn)}</span>` : ''}
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="active" 
                name="active"
                ${formData.active ? 'checked' : ''}
              />
              <span>Active</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-btn" ${state === 'loading' ? 'disabled' : ''}>
              ${this.escapeHtml(submitLabel)}
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-form-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Update form fields with current view model data
   */
  private updateFormFields(): void {
    const { formData } = this.viewModel;

    const employeeNoInput = this.container.querySelector('#employeeNo') as HTMLInputElement;
    const firstNameInput = this.container.querySelector('#firstName') as HTMLInputElement;
    const lastNameInput = this.container.querySelector('#lastName') as HTMLInputElement;
    const ssnInput = this.container.querySelector('#ssn') as HTMLInputElement;
    const activeInput = this.container.querySelector('#active') as HTMLInputElement;

    if (employeeNoInput) employeeNoInput.value = formData.employeeNo;
    if (firstNameInput) firstNameInput.value = formData.firstName;
    if (lastNameInput) lastNameInput.value = formData.lastName;
    if (ssnInput) ssnInput.value = formData.ssn;
    if (activeInput) activeInput.checked = formData.active;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Cancel buttons
    const cancelButtons = this.container.querySelectorAll('#cancel-btn, #cancel-form-btn');
    cancelButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigate('/');
      });
    });

    // Form submission
    const form = this.container.querySelector('#employee-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const success = await this.viewModel.submit();
        if (success) {
          // Navigate back to list after successful save
          router.navigate('/');
        }
      });
    }

    // Real-time field updates
    const employeeNoInput = this.container.querySelector('#employeeNo') as HTMLInputElement;
    const firstNameInput = this.container.querySelector('#firstName') as HTMLInputElement;
    const lastNameInput = this.container.querySelector('#lastName') as HTMLInputElement;
    const ssnInput = this.container.querySelector('#ssn') as HTMLInputElement;
    const activeInput = this.container.querySelector('#active') as HTMLInputElement;

    if (employeeNoInput) {
      employeeNoInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.viewModel.updateField('employeeNo', target.value);
      });
    }

    if (firstNameInput) {
      firstNameInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.viewModel.updateField('firstName', target.value);
      });
    }

    if (lastNameInput) {
      lastNameInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.viewModel.updateField('lastName', target.value);
      });
    }

    if (ssnInput) {
      ssnInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const formatted = formatSSN(target.value);
        target.value = formatted;
        this.viewModel.updateField('ssn', formatted);
      });
    }

    if (activeInput) {
      activeInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.viewModel.updateField('active', target.checked);
      });
    }
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
