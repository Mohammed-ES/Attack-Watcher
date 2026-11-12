# Dependency update plan

Update the following 18 dependencies in `frontend/package.json` without breaking the existing code. The project uses **npm**.

## Rules

- Use npm for every change and keep its lockfile in sync. Do not switch package managers or edit the lockfile by hand.
- Work through the groups below in order, from lowest to highest risk.
- After each step, run `npm run lint`, `npm run build` and fix any failure before continuing.
- Do not update packages that are not listed here, and do not change version ranges of other dependencies.
- If an update cannot be completed safely, revert it, explain why, and continue with the rest.
- When you finish, summarize what was updated, what code changed, and anything that still needs my attention.

## Patch updates (low risk)

Bug fixes only. Update them together, then run the verification commands.

| Package | Type | Declared | Installed | Target | Command | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `eslint-plugin-react` | dev | `^7.37.4` | 7.37.5 | `7.37.5` | `npm install --save-dev eslint-plugin-react@7.37.5` | [Release notes](https://github.com/jsx-eslint/eslint-plugin-react/releases) |
| `postcss` | dev | `^8.5.1` | 8.5.32 | `8.5.32` | `npm install --save-dev postcss@8.5.32` | [Release notes](https://github.com/postcss/postcss/releases) |

## Minor updates (medium risk)

New features that should be backward compatible. Update them together, run the verification commands, and if anything fails, bisect by updating one package at a time.

| Package | Type | Declared | Installed | Target | Command | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `autoprefixer` | dev | `^10.4.20` | 10.6.2 | `10.6.2` | `npm install --save-dev autoprefixer@10.6.2` | [Release notes](https://github.com/postcss/autoprefixer/releases) |
| `lucide-react` | prod | `^1.16.0` | 1.72.0 | `1.72.0` | `npm install lucide-react@1.72.0` | [Release notes](https://github.com/lucide-icons/lucide/releases) |
| `tailwind-merge` | prod | `^3.0.2` | 3.7.0 | `3.7.0` | `npm install tailwind-merge@3.7.0` | [Release notes](https://github.com/dcastil/tailwind-merge/releases) |

## Major updates (high risk, may contain breaking changes)

Update ONE package at a time, or one set of packages marked to be updated together. Before each one, read its release notes or migration guide, search the codebase for the APIs it changed, adapt the code, and run the verification commands before moving on to the next.

| Package | Type | Declared | Installed | Target | Command | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `@eslint/js` | dev | `^9.20.0` | 9.39.5 | `10.0.1` | `npm install --save-dev @eslint/js@10.0.1` | Update together with `eslint` (same repository); [Release notes](https://github.com/eslint/eslint/releases) |
| `@types/react` | dev | `^18.3.18` | 18.3.31 | `19.3.0` | `npm install --save-dev @types/react@19.3.0` | Update together with `@types/react-dom` (same repository); [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases) |
| `@types/react-dom` | dev | `^18.3.5` | 18.3.7 | `19.3.0` | `npm install --save-dev @types/react-dom@19.3.0` | Update together with `@types/react` (same repository); [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases) |
| `@vitejs/plugin-react` | dev | `^4.3.4` | 4.7.0 | `6.3.0` | `npm install --save-dev @vitejs/plugin-react@6.3.0` | [Release notes](https://github.com/vitejs/vite-plugin-react/releases) |
| `eslint` | dev | `^9.20.0` | 9.39.5 | `10.14.0` | `npm install --save-dev eslint@10.14.0` | Update together with `@eslint/js` (same repository); [Release notes](https://github.com/eslint/eslint/releases) |
| `eslint-plugin-react-hooks` | dev | `^5.1.0` | 5.2.0 | `7.1.1` | `npm install --save-dev eslint-plugin-react-hooks@7.1.1` | [Release notes](https://github.com/facebook/react/releases) |
| `eslint-plugin-react-refresh` | dev | `^0.4.19` | 0.4.26 | `0.5.7` | `npm install --save-dev eslint-plugin-react-refresh@0.5.7` | Treated as major: in 0.x versions a minor update may contain breaking changes; [Release notes](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/releases) |
| `globals` | dev | `^15.15.0` | 15.15.0 | `17.14.0` | `npm install --save-dev globals@17.14.0` | [Release notes](https://github.com/sindresorhus/globals/releases) |
| `react` | prod | `^18.3.1` | 18.3.1 | `19.3.1` | `npm install react@19.3.1` | Update together with `react-dom` (same repository); [Release notes](https://github.com/react/react/releases) |
| `react-dom` | prod | `^18.3.1` | 18.3.1 | `19.3.1` | `npm install react-dom@19.3.1` | Update together with `react` (same repository); [Release notes](https://github.com/react/react/releases) |
| `recharts` | prod | `^2.15.1` | 2.15.4 | `3.10.1` | `npm install recharts@3.10.1` | [Release notes](https://github.com/recharts/recharts/releases) |
| `tailwindcss` | dev | `^3.4.17` | 3.4.19 | `4.3.5` | `npm install --save-dev tailwindcss@4.3.5` | [Release notes](https://github.com/tailwindlabs/tailwindcss/releases) |
| `vite` | dev | `^6.1.0` | 6.4.6 | `8.3.8` | `npm install --save-dev vite@8.3.8` | [Release notes](https://github.com/vitejs/vite/releases) |
