import { createBrowserRouter } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RootLayout } from './components/layouts/RootLayout';
import { RequireAuth } from './components/RequireAuth';
import A4Preview from './pages/A4Preview';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PaperSetup from './pages/PaperSetup';
import PrintPreviewPage from './pages/PrintPreviewPage';
import QuestionBuilder from './pages/QuestionBuilder';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'setup/:paperId?',
        element: <PaperSetup />,
      },
      {
        path: 'builder/:paperId',
        element: <QuestionBuilder />,
      },
      {
        path: 'preview/:paperId',
        element: <A4Preview />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'print-preview',
        element: <PrintPreviewPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
