# SMIS Student Results Portal

Students choose a form, search the students returned by the API, select a student, and view that student's current result in the browser.

The student picker loads class records from `https://lynxtechmedia.com/ronaldstech/smis-api/v1/students.php?form=1&school=day`. The results view requests JSON for the selected student from `https://lynxtechmedia.com/ronaldstech/smis-api/v1/results.php?student_id=1033` and renders the subject marks in the browser.

## Local setup

Set `VITE_API_URL` when the API is hosted somewhere other than `/smis-api/api/index.php`:

```text
VITE_API_URL=https://your-host.example/smis-api/api/index.php
```

For local Vite development, the PHP API must allow `http://localhost:5173` or `http://127.0.0.1:5173` as configured in `src/smis-api/api/index.php`. PHP, MySQL, and the existing SMIS database are required for the student flow.

The current database has no student password column, so the initial sign-in uses registration number plus surname. Before public deployment, add a dedicated password or one-time access-code field to `students`, replace this temporary check with a password hash (`password_hash`/`password_verify`), and add rate limiting.

## Frontend structure

- `src/api/` contains HTTP functions for student and result requests.
- `src/hooks/` contains the student directory loading and filtering state.
- `src/components/` contains the portal header, student picker, selected student, result panel, and footer.
- `src/App.jsx` coordinates the page state and event handlers.

## Frontend commands

```bash
npm run dev
npm run lint
npm run build
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
