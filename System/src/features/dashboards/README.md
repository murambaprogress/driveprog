# Dashboards Integration

This folder contains the integrated Admin and User dashboards, including all components, charts, mock data, and types.

## Routes

- `/dashboard` or `/dashboard/:view` — User Dashboard
- `/admin` or `/admin/:view` — Admin Dashboard

## Structure

- `components/` — All dashboard React components
- `components/charts/` — Chart components
- `data/` — Mock data and chart data
- `types/` — Shared TypeScript types

## Usage

Dashboards are lazy-loaded and accessible via the main app routes. All styling uses Tailwind CSS.

## Maintenance

- Update mock data in `data/` as needed.
- Add new dashboard features/components in `components/`.

## Troubleshooting

- Ensure all imports use correct relative paths.
- If you see missing icons, run `npm install lucide-react`.

---

©Market.Maker.Softwares 2025 DriveCash. All rights reserved.
