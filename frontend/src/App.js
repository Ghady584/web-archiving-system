import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import { CreateDocument, EditDocument, DocumentDetail, Categories, Users, Profile } from './pages/PageStubs';
import Archive from './pages/Archive';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" dir="rtl">
          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<Documents />} />
              <Route path="documents/new" element={<CreateDocument />} />
              <Route path="documents/:id" element={<DocumentDetail />} />
              <Route path="documents/:id/edit" element={<EditDocument />} />
              <Route path="archive" element={<Archive />} />
              <Route
                path="categories"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Categories />
                  </PrivateRoute>
                }
              />
              <Route
                path="users"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
