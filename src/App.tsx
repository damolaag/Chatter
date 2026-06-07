import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { EditorPage } from "./pages/EditorPage";
import { PostPage } from "./pages/PostPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { BookmarksPage } from "./pages/BookmarksPage";
import Notifications from "./pages/Notifications";
import { SearchPage } from "./pages/SearchPage";
import { TagPage } from "./pages/TagPage";
import { TrendingPage } from "./pages/TrendingPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/posts/:slug" element={<PostPage />} />

          <Route path="/profiles/:id" element={<ProfilePage />} />

          <Route path="/search" element={<SearchPage />} />

          <Route path="/tags/:slug" element={<TagPage />} />

          <Route path="/trending" element={<TrendingPage />} />

          {/* Protected Routes */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <BookmarksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}