 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorLayout from "./pages/creator/CreatorLayout";
import BackerLayout from "./pages/backer/Backerlayout";
import BackerHome from "./pages/backer/Backerhome";
import BackerBrowse from "./pages/backer/Backerbrowse";
import { BackerFundings, BackerSaved, BackerWallet, BackerProfile } from "./pages/backer/Backerpages";
import InvestorLayout from "./pages/investor/InvestorLayout";
import InvestorHome from "./pages/investor/InvestorHome";
import InvestorBrowse from "./pages/investor/Investorbrowse";
import InvestorDeals from "./pages/investor/Investordeals";
import InvestorRequests from "./pages/investor/Investorrequests";
import InvestorAgreements from "./pages/investor/Investoragreements";
import { InvestorPortfolio, InvestorWallet, InvestorProfile } from "./pages/investor/Investorpages";
import AdminLayout from "./pages/admin/AdminLayout";
import CentralFeed from "./pages/CentralFeed";
import ProjectDetail from "./pages/ProjectDetail";
import useAuthStore from "./store/authStore";

function AuthGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
        <Route path="/register" element={<AuthGuard><RegisterPage /></AuthGuard>} />
        <Route path="/creator/dashboard/*" element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorLayout />
          </ProtectedRoute>
        } />
        <Route path="/investor/dashboard" element={
          <ProtectedRoute allowedRoles={["investor"]}>
            <InvestorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<InvestorHome />} />
          <Route path="browse" element={<InvestorBrowse />} />
          <Route path="deals" element={<InvestorDeals />} />
          <Route path="requests" element={<InvestorRequests />} />
          <Route path="agreements" element={<InvestorAgreements />} />
          <Route path="portfolio" element={<InvestorPortfolio />} />
          <Route path="wallet" element={<InvestorWallet />} />
          <Route path="profile" element={<InvestorProfile />} />
        </Route>
        <Route path="/backer/dashboard" element={
          <ProtectedRoute allowedRoles={["backer"]}>
            <BackerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<BackerHome />} />
          <Route path="browse" element={<BackerBrowse />} />
          <Route path="fundings" element={<BackerFundings />} />
          <Route path="saved" element={<BackerSaved />} />
          <Route path="wallet" element={<BackerWallet />} />
          <Route path="profile" element={<BackerProfile />} />
        </Route>
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute allowedRoles={["backer", "investor", "creator", "admin"]}>
            <CentralFeed />
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute allowedRoles={["backer", "investor", "creator", "admin"]}>
            <ProjectDetail />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}