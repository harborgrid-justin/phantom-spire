# Application Layer

This directory contains the Next.js `app` router, which handles all frontend routing and API endpoints.

## Structure

- **Route Groups**: Routes are organized into groups like `(app)` and `(marketing)` to manage layouts and authentication without affecting the URL.
- **API Routes**: All API endpoints are versioned under `/api/v1` and grouped by domain (`ml`, `threat-intel`, `platform`, `phantom`).
- **Co-location**: Route-specific components, hooks, and types are co-located within private `_components` and `_lib` folders inside each route's directory.
