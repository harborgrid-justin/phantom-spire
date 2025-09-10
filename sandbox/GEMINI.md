# Monorepo with npm Workspaces

This project is a monorepo using npm workspaces. The structure is as follows:

```
/
├── packages/
│   ├── workspace-1/
│   │   ├── index.js
│   │   └── package.json
│   ├── workspace-2/
│   │   ├── index.js
│   │   └── package.json
│   ├── workspace-3/
│   │   ├── index.js
│   │   └── package.json
│   ├── workspace-4/
│   │   └── package.json
│   └── workspace-5/
│       └── package.json
└── package.json
```

## Root `package.json`

The root `package.json` defines the workspaces and is the single source of truth for top-level dependencies and scripts.

```json
{
  "name": "sandbox",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "npm test --workspaces",
    "lint": "eslint .",
    "start:workspace-2": "node packages/workspace-2/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "eslint": "^8.0.0"
  }
}
```

## Advanced Features

### Cross-Workspace Dependencies

Workspaces can depend on each other. In this project, `workspace-2` depends on `workspace-1`.

`packages/workspace-2/package.json`:
```json
{
  "name": "workspace-2",
  ...
  "dependencies": {
    "workspace-1": "1.0.0"
  }
}
```

`packages/workspace-1/index.js` exports a function:
```javascript
module.exports = () => console.log("Hello from workspace-1!");
```

And `packages/workspace-2/index.js` imports and uses it:
```javascript
const workspace1 = require("workspace-1");

workspace1();
```

To see this in action, run:
```bash
npm run start:workspace-2
```
This will execute the `index.js` file in `workspace-2`, which in turn will execute the code from `workspace-1`.

### Order of Operations

When you run `npm install` or run scripts with the `--workspaces` flag, npm is smart enough to understand the dependency graph between your workspaces. It will perform a topological sort to ensure that packages are processed in the correct order.

For example, because `workspace-2` depends on `workspace-1`, npm will always ensure that `workspace-1` is installed and linked before `workspace-2`. If you were running a build script across all workspaces, it would run the script in `workspace-1` *before* running it in `workspace-2`. This prevents errors where a dependent package is not yet available.

### Shared Dev Dependencies

Dev dependencies like linters or test runners can be installed in the root `package.json` and shared across all workspaces. We have `eslint` installed at the root.

To lint all files in the project, run:
```bash
npm run lint
```

### Running Scripts Across All Workspaces

You can run a script across all workspaces that have it defined. The root `package.json` has a `test` script that does this.

```bash
npm run test
```
This will execute `npm test` in every workspace, respecting the dependency order described above.

## Workspace-3: Express Server

`workspace-3` contains an Express server that uses the `phantom-attribution-core` package and a SQLite database.

To start the server, run:
```bash
npm start --workspace=workspace-3
```
The server will start on `http://localhost:3000`.

### API Endpoints

*   **POST /api/threats/analyze**: Analyzes a threat indicator.
    *   Body: `{ "indicator": "..." }`
*   **GET /api/threats**: Returns all threat analysis reports.
*   **GET /api/actors/:name**: Retrieves the profile of a threat actor.
*   **GET /api/actors**: Returns all actor profiles.
*   **POST /api/campaigns/track**: Tracks a threat campaign.
    *   Body: `{ "name": "..." }`
*   **GET /api/campaigns**: Returns all campaign tracking data.
