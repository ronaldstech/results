# SMIS Student Results Portal

Students can sign in with their registration number and surname, then download only their own current report. The PHP API keeps the student ID in the server session; the browser cannot choose another student or class.

## Local setup

Set `VITE_API_URL` when the API is hosted somewhere other than `/smis-api/api/index.php`:

```text
VITE_API_URL=https://your-host.example/smis-api/api/index.php
```

For local Vite development, the PHP API must allow `http://localhost:5173` or `http://127.0.0.1:5173` as configured in `src/smis-api/api/index.php`. PHP, MySQL, and the existing SMIS database are required for the student flow.

The current database has no student password column, so the initial sign-in uses registration number plus surname. Before public deployment, add a dedicated password or one-time access-code field to `students`, replace this temporary check with a password hash (`password_hash`/`password_verify`), and add rate limiting.

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
