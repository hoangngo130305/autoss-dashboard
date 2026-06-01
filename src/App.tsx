import { RouterProvider } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './context/ToastContext';
import { router } from './routes';

export default function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AppStoreProvider>
  );
}
