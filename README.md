# SpeedyLabs Dashboard

A modern dashboard application built with React and TypeScript, featuring real-time analytics and data visualization.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI Components**:
  - ShadcnUI (Built on Radix UI)
  - Tailwind CSS for styling
  - Lucide React for icons
- **Data Visualization**: Recharts
- **Data Management**: SWR for data fetching and caching
- **Mock API**: MirageJS for development and testing
- **Development Tools**:
  - ESLint for code linting
  - TypeScript for type safety
  - Faker.js for generating mock data

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd speedylabs
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Build

To create a production build:

```bash
npm run build
# or
yarn build
```

## Approach

The project was built with a focus on modern development practices and developer experience:

1. **UI Framework Selection**:

   - Chose ShadcnUI with Tailwind CSS for its extensive collection of pre-built components and customization options
   - This combination provides a robust foundation for building a professional-looking dashboard quickly
   - The component library is well-maintained and follows accessibility best practices

2. **Development Efficiency**:

   - Leveraged AI tools for routine tasks like code commenting and optimization
   - Used TypeScript for better type safety and developer experience
   - Implemented a mock API using MirageJS to simulate backend functionality during development

3. **Data Visualization**:

   - Utilized Recharts for creating responsive and interactive charts
   - Implemented real-time data updates using SWR for optimal user experience

4. **Code Organization**:
   - Followed a modular component structure
   - Separated business logic from UI components
   - Used TypeScript interfaces for better type safety and code documentation

## Trade-offs

1. **Recharts vs Chart.js**:

   - Chose Recharts over Chart.js despite its fewer features
   - Reasoning: Better integration with ShadcnUI and React ecosystem
   - Benefits: Smaller bundle size and better TypeScript support
   - Drawbacks: Less customization options compared to Chart.js

2. **MirageJS for Mock API**:

   - Pros: Quick setup and realistic API simulation
   - Cons: Adds to bundle size in development
   - Alternative considered: JSON-Server, but MirageJS offered better TypeScript support and more realistic API behavior

3. **SWR vs React Query**:

   - Chose SWR for its simplicity and lighter weight
   - Trade-off: Fewer advanced features compared to React Query, but sufficient for current needs

4. **Bundle Size vs Feature Set**:
   - Focused on maintaining a balance between features and performance
   - Carefully selected dependencies to avoid bloating the application
   - Used code splitting and lazy loading where appropriate
