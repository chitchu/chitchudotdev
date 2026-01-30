# Claude Instructions for chitchudotdev

## Project Overview

This is a **Next.js personal portfolio website** for chitchu.dev. It's a minimal, single-page application showcasing the developer with an interactive animated background.

## Tech Stack

- **Framework:** Next.js 12.2.0 with React 18
- **Language:** TypeScript 4.7.4
- **Styling:** CSS Modules
- **Package Manager:** Yarn 3.2.1 (PnP mode)
- **Animation:** Vanta.js with Three.js (loaded via CDN)

## Development Commands

```bash
yarn dev      # Start development server at http://localhost:3000
yarn build    # Build for production
yarn start    # Start production server
```

## Project Structure

```
pages/
  _app.tsx        # Global app wrapper
  index.tsx       # Main landing page with Vanta.js background
styles/
  globals.css     # Global styles
  Home.module.css # Home page CSS modules
public/           # Static assets (GitHub icons)
```

## Code Style

- **ESLint** and **Prettier** are configured for consistent formatting
- Use single quotes, 2-space indentation, trailing commas (ES5), and semicolons
- Follow React hooks best practices (enforced by eslint-plugin-react-hooks)
- TypeScript strict mode is disabled

## Key Considerations

1. **Vanta.js Background:** The interactive dots animation is initialized in `pages/index.tsx` using Next.js Script component with `lazyOnload` strategy
2. **CSS Modules:** Component styles use `.module.css` files for scoped styling
3. **Yarn PnP:** No `node_modules` folder - dependencies are managed via Yarn Plug'n'Play
4. **Responsive Design:** Mobile breakpoint at 600px width

## Testing Changes

Always run `yarn build` before committing to ensure the production build succeeds.
