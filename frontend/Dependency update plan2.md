# Dependency update plan

Update the following 6 dependencies in `frontend/package.json` without breaking the existing code. The project uses **npm**.

## Rules

- Use npm for every change and keep its lockfile in sync. Do not switch package managers or edit the lockfile by hand.
- Work through the groups below in order, from lowest to highest risk.
- After each step, run `npm run lint`, `npm run build` and fix any failure before continuing.
- Do not update packages that are not listed here, and do not change version ranges of other dependencies.
- If an update cannot be completed safely, revert it, explain why, and continue with the rest.
- When you finish, summarize what was updated, what code changed, and anything that still needs my attention.

## Major updates (high risk, may contain breaking changes)

Update ONE package at a time, or one set of packages marked to be updated together. Before each one, read its release notes or migration guide, search the codebase for the APIs it changed, adapt the code, and run the verification commands before moving on to the next.

| Package | Type | Declared | Installed | Target | Command | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `@eslint/js` | dev | `^9.20.0` | 9.39.5 | `10.0.1` | `npm install --save-dev @eslint/js@10.0.1` | Update together with `eslint` (same repository); [Release notes](https://github.com/eslint/eslint/releases) |
| `eslint` | dev | `^9.20.0` | 9.39.5 | `10.14.0` | `npm install --save-dev eslint@10.14.0` | Update together with `@eslint/js` (same repository); [Release notes](https://github.com/eslint/eslint/releases) |
| `eslint-plugin-react-hooks` | dev | `^5.1.0` | 5.2.0 | `7.1.1` | `npm install --save-dev eslint-plugin-react-hooks@7.1.1` | [Release notes](https://github.com/facebook/react/releases) |
| `eslint-plugin-react-refresh` | dev | `^0.4.19` | 0.4.26 | `0.5.7` | `npm install --save-dev eslint-plugin-react-refresh@0.5.7` | Treated as major: in 0.x versions a minor update may contain breaking changes; [Release notes](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/releases) |
| `globals` | dev | `^15.15.0` | 15.15.0 | `17.14.0` | `npm install --save-dev globals@17.14.0` | [Release notes](https://github.com/sindresorhus/globals/releases) |
| `tailwindcss` | dev | `^3.4.17` | 3.4.19 | `4.3.5` | `npm install --save-dev tailwindcss@4.3.5` | [Release notes](https://github.com/tailwindlabs/tailwindcss/releases) |
