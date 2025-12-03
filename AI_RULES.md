# AI Studio Application Rules

This document outlines the core technologies and guidelines for developing and modifying the "Loja & Studio Célia Hair" application.

## Tech Stack Overview

*   **React**: The application is built using React for its component-based architecture and efficient UI updates.
*   **TypeScript**: All application code is written in TypeScript, ensuring type safety, better maintainability, and improved developer experience.
*   **Tailwind CSS**: Styling is handled exclusively with Tailwind CSS, providing utility-first classes for rapid and consistent UI development.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **Lucide React**: Used for all icons throughout the application, offering a wide range of customizable vector icons.
*   **Recharts**: Employed for rendering responsive charts and data visualizations, particularly in financial and analytical screens.
*   **Google GenAI**: Integrated for AI-powered features, such as image editing and transformations, via the `@google/genai` library.
*   **Vite**: The project uses Vite as its build tool, offering a fast development server and optimized build process.
*   **Local Storage (Mock API)**: For data persistence and backend simulation, the application utilizes browser's Local Storage, abstracted through `services/api.ts`.
*   **Custom Screen Management**: Navigation between different sections of the application is managed through a custom state-based system within `App.tsx`, rather than a dedicated routing library like React Router.

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following guidelines when developing:

*   **UI Components**:
    *   **Prioritize shadcn/ui**: For common UI elements (buttons, inputs, cards, modals, etc.), always try to use components from the `shadcn/ui` library.
    *   **Custom Components**: If a `shadcn/ui` component does not exist or doesn't meet specific requirements, create a new, small, and focused React component in `src/components/` using Tailwind CSS for styling.
*   **Styling**:
    *   **Tailwind CSS Only**: All styling must be done using Tailwind CSS utility classes. Avoid inline styles or custom CSS files unless absolutely necessary for very specific, complex cases (and only after discussion).
*   **Icons**:
    *   **Lucide React**: Use icons exclusively from the `lucide-react` library.
*   **Charting & Data Visualization**:
    *   **Recharts**: For any charts or graphs, use the `recharts` library.
*   **State Management**:
    *   **React Hooks & Context**: Utilize React's built-in `useState` and `useContext` hooks for managing component and global application state. The `DataContext` in `src/context/DataContext.tsx` is the central place for global data.
*   **Routing**:
    *   **Existing System**: Continue to use the existing state-based screen management system defined in `App.tsx`. Do not introduce `react-router-dom` or other routing libraries unless explicitly instructed.
*   **API Interaction**:
    *   **`services/api.ts`**: All data fetching and manipulation (CRUD operations) should go through the `api` object defined in `services/api.ts`. This file abstracts the underlying data storage (currently Local Storage).
*   **AI Integration**:
    *   **`services/geminiService.ts`**: For any AI-related functionalities, interact with the Google GenAI model through the `editImageWithGemini` function or similar functions added to `services/geminiService.ts`.