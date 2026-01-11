# HR Management Application

A Single Page Application (SPA) for managing employee information, built with TypeScript using the MVVM (Model-View-ViewModel) pattern. This application provides a clean, responsive interface for performing CRUD operations on employee records.

## Features

- **Employee List View**: Display all employees in a responsive table
- **Add Employee**: Create new employee records with validation
- **Edit Employee**: Update existing employee information
- **Delete Employee**: Remove employees with confirmation
- **Field Validation**: Real-time validation for SSN format, names, and required fields
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during API operations

## Architecture

This application follows the **MVVM (Model-View-ViewModel)** pattern:

- **Models** (`src/models/`): Data structures and transformation utilities
- **ViewModels** (`src/viewmodels/`): Business logic and state management
- **Views** (`src/views/`): UI rendering and user interaction handling
- **Services** (`src/services/`): API communication layer
- **Utils** (`src/utils/`): Router and validation utilities

### Data Flow

```
User Action → View → ViewModel → ApiService → API
                ↑                              ↓
                └────────── Update UI ─────────┘
```

## Project Structure

```
src/
├── models/
│   └── Employee.ts              # Employee data model
├── viewmodels/
│   ├── EmployeeListViewModel.ts # List view state management
│   └── EmployeeFormViewModel.ts # Form view state management
├── views/
│   ├── EmployeeListView.ts     # Employee list UI
│   └── EmployeeFormView.ts      # Employee form UI
├── services/
│   └── ApiService.ts            # API communication
├── utils/
│   ├── router.ts                # SPA routing
│   └── validation.ts            # Field validation
├── styles/
│   └── main.css                 # Application styles
├── config.ts                    # Configuration
└── main.ts                      # Application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API Key for the Modularis API

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Test1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Option 1: Create a `.env` file in the root directory:
   ```env
   VITE_API_KEY=your-api-key-here
   ```

   Option 2: The application will prompt you for the API key on first launch. The key will be stored in localStorage for subsequent sessions.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will open at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

   The production build will be in the `dist/` directory.

6. **Preview production build**
   ```bash
   npm run preview
   ```

## API Configuration

The application connects to the Modularis API. The base configuration is in `src/config.ts`:

- **Base URL**: `https://gateway.modularis.com/HRDemo/RESTActivityWebService/HRDemo.Example`
- **Customer ID**: `C93F949C-41B8-4C9E-95AA-B030B31F6F3F`
- **API Key**: Set via environment variable or user prompt

## Employee Data Model

Each employee record contains:
- **ID**: Unique identifier (PersonID from API)
- **SSN**: Social Security Number (format: XXX-XX-XXXX)
- **First Name**: Employee's first name
- **Last Name**: Employee's last name
- **Active**: Status (Active/Inactive)

## Validation Rules

- **SSN**: Must match format XXX-XX-XXXX (auto-formatted as user types)
- **First Name**: Required, 2-50 characters, letters, spaces, hyphens, and apostrophes only
- **Last Name**: Required, 2-50 characters, letters, spaces, hyphens, and apostrophes only
- **Active**: Boolean checkbox

## Usage

### Viewing Employees

Navigate to the home page (`/`) to see the list of all employees. The list displays:
- Employee ID
- SSN
- First Name
- Last Name
- Status (Active/Inactive)
- Action buttons (Edit/Delete)

### Adding an Employee

1. Click the "Add New Employee" button
2. Fill in the required fields:
   - First Name
   - Last Name
   - SSN (auto-formatted)
   - Active status (checkbox)
3. Click "Create Employee"
4. The form validates input before submission
5. On success, you'll be redirected to the employee list

### Editing an Employee

1. Click the "Edit" button next to an employee in the list
2. Modify the desired fields
3. Click "Update Employee"
4. On success, you'll be redirected to the employee list

### Deleting an Employee

1. Click the "Delete" button next to an employee
2. Confirm the deletion in the dialog
3. The employee will be removed and the list will refresh

## Technical Decisions

### Framework Choice
- **No UI Frameworks**: Pure TypeScript with DOM manipulation to meet requirements
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and modern JavaScript features

### MVVM Implementation
- **ViewModels**: Manage state and business logic, notify views of changes
- **Views**: Handle DOM manipulation and user interactions
- **Models**: Define data structures and transformations
- **Services**: Encapsulate API communication

### Routing
- Hash-based routing for simple SPA navigation
- Supports routes: `/`, `/add`, `/edit/:id`

### Error Handling
- Custom `ApiError` class for API errors
- User-friendly error messages
- Network error handling
- Loading states for async operations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Code Organization

- All TypeScript files are in `src/`
- Styles are in `src/styles/`
- Entry point is `src/main.ts`
- HTML template is `index.html`

## Assumptions

1. **API Key Management**: The API key can be provided via environment variable or user prompt. It's stored in localStorage for convenience.

2. **Employee ID Generation**: When creating a new employee, a UUID is generated if not provided. The API may override this.

3. **Status Mapping**: The API uses a numeric Status field (0 = Active, other = Inactive), which is mapped to a boolean `active` field in the UI.

4. **Field Display**: Only the required fields (ID, SSN, First Name, Last Name, Active) are displayed, even though the API returns additional fields.

5. **Error Messages**: API errors are displayed to users in a user-friendly format. Network errors are handled gracefully.

## Future Enhancements

Potential improvements that could be added:
- Search and filter functionality
- Pagination for large employee lists
- Bulk operations
- Export functionality
- Advanced validation rules
- Unit and integration tests
- Accessibility improvements (ARIA labels, keyboard navigation)

## License

ISC
