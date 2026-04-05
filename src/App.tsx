import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/features/auth/AuthContext";
import { DiagnosisWizardPage } from "@/pages/DiagnosisWizardPage";
import { DiagnosesListPage } from "@/pages/DiagnosesListPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { SyncPage } from "@/pages/SyncPage";
import { ChangePasswordRoute } from "@/routes/ChangePasswordRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      /** Permite ler Dexie / cache mesmo com `navigator.onLine === false`. */
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

const router = createBrowserRouter([
  { path: "/privacidade", element: <PrivacyPolicyPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/alterar-senha", element: <ChangePasswordRoute /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "diagnosticos", element: <DiagnosesListPage /> },
          { path: "diagnostico/novo", element: <DiagnosisWizardPage /> },
          { path: "diagnostico/:localId", element: <DiagnosisWizardPage /> },
          { path: "sync", element: <SyncPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
