# Copilot Instructions for flexmanage-pro

## Project Architecture

- **Monorepo Structure:** The main app is in `flexmanage-pro-main/`. Key UI components are in `src/components/ui/`, pages in `src/pages/`, and Supabase integration in `src/integrations/supabase/`.
- **Data Layer:** All persistent data is managed via Supabase. CRUD operations must use Supabase client methods (`supabase.from(...).select/insert/update/delete`)—never use mock data or local state for persistent entities.
- **Authentication:** User authentication is handled via Supabase. The login flow should use Supabase's auth API. Only authenticated users can access the dashboard and other protected routes.
- **Routing:** Page components in `src/pages/` are routed using React Router (or Next.js if detected). The default route should be the login page. After successful login, redirect to `/dashboard`.
- **Sidebar & Layout:** The sidebar (`src/components/ui/sidebar.tsx`) is always visible on desktop and toggled on mobile. Layout components are in `src/components/ui/` and should be reused for consistent UI.

## Developer Workflows

- **Build:** Use `npm run build` in `flexmanage-pro-main/` to build the project.
- **Dev Server:** Use `npm run dev` to start the local development server.
- **Testing:** No formal test suite detected; manual testing is standard. If adding tests, place them in `src/__tests__/` and use Jest.
- **Deployment:** Pushing to the main GitHub repo triggers Vercel auto-deploy. No manual deployment steps required.

## Patterns & Conventions

- **No Dummy Data:** All data must be fetched from Supabase. Remove any mock data or static arrays.
- **CRUD:** Implement CRUD using Supabase queries. Example:
  ```tsx
  const { data, error } = await supabase.from('membership_plans').select('*')
  ```
- **State Management:** Use React hooks (`useState`, `useEffect`) for local UI state. For global state, prefer context or Supabase subscriptions.
- **Styling:** Use Tailwind CSS classes for styling. Custom colors and variables are defined in `tailwind.config.js`.
- **Component Props:** Pass props explicitly; avoid implicit context except for authentication state.

## Integration Points

- **Supabase:** All data and auth flows go through Supabase. See `src/integrations/supabase/` for client setup and types.
- **Vercel:** Repo is connected to Vercel for CI/CD. No config files for other platforms detected.
- **External UI:** Uses `lucide-react` for icons and `@radix-ui/react-slot` for advanced UI composition.

## Examples

- **Login Redirect Pattern:**
  - On app load, check `supabase.auth.getUser()`. If not authenticated, show login page.
  - After login, redirect to `/dashboard`.
- **Sidebar Usage:**
  - Import and use `<Sidebar>` from `src/components/ui/sidebar.tsx` in your layout.
- **CRUD Example:**
  - Fetch memberships:
    ```tsx
    const { data } = await supabase.from('membership_plans').select('*')
    ```

## Key Files

- `src/pages/Login.tsx` — Login page (create if missing)
- `src/pages/Dashboard.tsx` — Main dashboard
- `src/components/ui/sidebar.tsx` — Sidebar component
- `src/integrations/supabase/` — Supabase client and types

---

**Feedback:**  
If any section is unclear or missing important project-specific details, please specify so I can iterate and improve these instructions.
