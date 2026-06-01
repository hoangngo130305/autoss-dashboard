import { RouterProvider } from "react-router-dom";
import { AppStoreProvider } from "./store/AppStore";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AppStoreProvider>
    </AuthProvider>
  );
}
