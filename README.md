# CampusDesk — Student Management System

A small frontend Student Management System built with **HTML, CSS and vanilla JavaScript** for a SIWES demonstration.

## Features
- Add student records
- Validate required fields and email/phone formats
- Prevent duplicate matriculation numbers
- View student records in a table
- Search by name, matriculation number, department or email
- Filter by academic level
- Edit and delete records
- Dashboard statistics
- Export records to CSV
- Responsive layout for mobile and desktop
- Save records in browser `localStorage`

## Run the project
1. Extract the ZIP file.
2. Open the `student_management_system` folder.
3. Double-click `index.html`, or open it in a modern browser.
4. Add sample records and test the functions.

No package installation or build process is required.

## Project files
- `index.html` — page structure and form/table layout
- `style.css` — styling and responsive layout
- `script.js` — validation, CRUD operations, search, filtering, local storage and CSV export

## Important limitations
This is a **frontend-only educational prototype**. Data is stored in the browser on the current device. It is not shared across users or computers and does not provide secure login, server-side authorisation, or a central database. Do not use it to store real confidential student information.

For a production deployment, add a backend API, a database, secure authentication and role-based authorisation, server-side validation, backups, and appropriate privacy/security controls.

## SIWES defence demonstration
1. Explain that HTML creates the structure, CSS controls presentation and JavaScript provides interaction.
2. Add a fictional student record.
3. Try submitting the form with required fields empty to show validation.
4. Add another record and try using the same matriculation number to show duplicate checking.
5. Search for a student and use the level filter.
6. Edit a record and then delete a record.
7. Export the student records as CSV.
8. Explain that localStorage is used for this prototype and describe why a real institution would need a secure backend and database.

Use fictional data during your demonstration.
