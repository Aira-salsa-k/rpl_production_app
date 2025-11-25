
// App.js (diperbaiki)
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // ✅ pastikan path benar
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Layout tanpa onLogout langsung
import Dashboardnew from './components/Dashboardnew';
import Cakes from './features/cakes/Cakes';
import Ingredients from './features/ingredients/Ingredients';
import Recipes from './features/recipes/Recipes';
import Productions from './features/productions/Productions';
import Distributions from './features/distributions/Distributions';
import Reports from './features/reports/Reports';

// 🔑 Wrapper untuk Layout yang inject onLogout
function AuthenticatedLayout() {
  const { signOut } = useAuth();

  return <Layout onLogout={signOut} />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Nested routes dengan layout */}
        <Route 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboardnew" replace />} />
          <Route path="dashboardnew" element={<Dashboardnew />} />
          <Route path="cakes" element={<Cakes />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="productions" element={<Productions />} />
          <Route path="distributions" element={<Distributions />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback: redirect / ke dashboard */}
        <Route path="/" element={<Navigate to="/dashboardnew" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;