# Feature-Based Architecture

This directory contains the different features of the application. Each feature is a self-contained module that encapsulates a specific business domain.

## Feature Structure

Each feature directory should follow this structure:

- **/api**: Contains API route handlers, server actions, and related types.
- **/components**: Contains React components specific to this feature.
- **/hooks**: Contains React hooks specific to this feature.
- **/lib**: Contains utility functions and business logic specific to this feature.
- **/types**: Contains TypeScript types and interfaces specific to this feature.

## Shared Code

Code that is shared across multiple features should be placed in the `src/shared` directory. This includes:

- `src/shared/ui`: Shared, generic React components.
- `src/shared/hooks`: Shared, generic React hooks.
- `src/shared/types`: Shared TypeScript types and interfaces.
- `src/shared/lib`: Shared utility functions.

By following this structure, we can ensure that our codebase is modular, scalable, and easy to maintain.
