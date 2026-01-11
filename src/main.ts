import { EmployeeListViewModel } from './viewmodels/EmployeeListViewModel';
import { EmployeeFormViewModel } from './viewmodels/EmployeeFormViewModel';
import { EmployeeListView } from './views/EmployeeListView';
import { EmployeeFormView } from './views/EmployeeFormView';
import { router } from './utils/router';
import { apiService } from './services/ApiService';

// Initialize ViewModels
const employeeListViewModel = new EmployeeListViewModel();
const employeeFormViewModel = new EmployeeFormViewModel();

// Get app container
const appContainer = document.getElementById('app');
if (!appContainer) {
  throw new Error('App container not found');
}

// Initialize views
let currentView: EmployeeListView | EmployeeFormView | null = null;

/**
 * Cleanup current view
 */
function cleanupView(): void {
  if (currentView) {
    currentView.destroy();
    currentView = null;
  }
}

/**
 * Show employee list view
 */
function showEmployeeList(): void {
  cleanupView();
  const view = new EmployeeListView(employeeListViewModel, appContainer);
  view.render();
  currentView = view;
  employeeListViewModel.loadEmployees();
}

/**
 * Show add employee form
 */
function showAddEmployeeForm(): void {
  cleanupView();
  employeeFormViewModel.initializeForAdd();
  const view = new EmployeeFormView(employeeFormViewModel, appContainer);
  view.render();
  currentView = view;
}

/**
 * Show edit employee form
 */
function showEditEmployeeForm(params?: Record<string, string>): void {
  if (!params || !params.id) {
    router.navigate('/');
    return;
  }

  cleanupView();
  const view = new EmployeeFormView(employeeFormViewModel, appContainer);
  view.render();
  currentView = view;
  employeeFormViewModel.initializeForEdit(params.id);
}

// Setup API key from environment or prompt user
function initializeApiKey(): void {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    apiService.setApiKey(apiKey);
  } else {
    // Prompt user for API key if not set
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      apiService.setApiKey(storedApiKey);
    } else {
      const userApiKey = prompt('Please enter your API Key:');
      if (userApiKey) {
        apiService.setApiKey(userApiKey);
        localStorage.setItem('apiKey', userApiKey);
      } else {
        alert('API Key is required to use this application.');
      }
    }
  }
}

// Initialize routing
function initializeRouter(): void {
  router.on('/', showEmployeeList);
  router.on('/add', showAddEmployeeForm);
  router.on('/edit/:id', showEditEmployeeForm);
}

// Initialize application
function init(): void {
  initializeApiKey();
  initializeRouter();
}

// Start the application
init();
