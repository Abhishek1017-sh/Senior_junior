# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Deployment to Vercel

To deploy this frontend on Vercel and connect it to your Railway backend, set these production environment variables in the Vercel dashboard:

- `VITE_API_BASE_URL` = `https://seniorjunior-production.up.railway.app/api`
- `VITE_SOCKET_URL` = `https://seniorjunior-production.up.railway.app`

Also configure your Railway backend to allow requests from your Vercel frontend domain by setting `FRONTEND_URL` in Railway to your Vercel app URL, for example `https://senior-junior-3e2w.vercel.app`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
