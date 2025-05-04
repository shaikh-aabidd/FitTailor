// src/router.js
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import {
  HomePage,
  ProductsPage,
  ProductDetailsPage,
  LoginPage,
  SignupPage,
  CartPage,
  ProfilePage,
  MeasurementPage,
  CheckoutPage,
  CustomizationPage,
  OrderTrackingPage,
} from './pages';
import { NotFound, Step1Garment, Step2StyleFabric, Step3Measurements, Step4Tailor, Step5ReviewAddOns } from './components';
import AdminProductPage from './pages/AdminProductPage';
import AdminUserRolePage from './pages/AdminUserRolePage';

export default createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* public */}
      <Route index element={<HomePage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="product/:id" element={<ProductDetailsPage />} />

      {/* login/signup (public but redirect away if already authed) */}
      <Route
        path="login"
        element={
          <AuthLayout authentication={false}>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="signup"
        element={
          <AuthLayout authentication={false}>
            <SignupPage />
          </AuthLayout>
        }
      />

      {/* protected */}
      <Route
        path="cart"
        element={
          <AuthLayout authentication={true}>
            <CartPage />
          </AuthLayout>
        }
      />
      <Route
        path="profile"
        element={
          <AuthLayout authentication={true}>
            <ProfilePage />
          </AuthLayout>
        }
      />
      <Route
        path="measurement/:id?view=true"
        element={
          <AuthLayout authentication={true}>
            <MeasurementPage />
          </AuthLayout>
        }
      />
      <Route
        path="measurement/new"
        element={
          <AuthLayout authentication={true}>
            <MeasurementPage />
          </AuthLayout>
        }
      />
      <Route
        path="measurement/:id"
        element={
          <AuthLayout authentication={true}>
            <MeasurementPage />
          </AuthLayout>
        }
      />

      <Route
        path="checkout"
        element={
          <AuthLayout authentication={true}>
            <CheckoutPage />
          </AuthLayout>
        }
      />

      <Route
        path="orders/track"
        element={
          <AuthLayout authentication={true}>
            <OrderTrackingPage />
          </AuthLayout>
        }
      />

      <Route
        path="/AdminUserRolePage"
        element={
          <AuthLayout authentication={true} roles={"admin"}>
            <AdminUserRolePage />
          </AuthLayout>
        }
      />

      <Route
        path="/AdminProductPage"
        element={
          <AuthLayout authentication={true} roles={"admin"}>
            <AdminProductPage />
          </AuthLayout>
        }
      />

      <Route
        path="customize"
        element={
          <AuthLayout authentication={true}>
            <CustomizationPage />
          </AuthLayout>
        }
      >
        <Route path="step1" element={<Step1Garment />} />
        <Route path="step2" element={<Step2StyleFabric />} />
        <Route path="step3" element={<Step3Measurements />} />
        <Route path="step4" element={<Step4Tailor />} />
        <Route path="step5" element={<Step5ReviewAddOns />} />
        {/* <Route path="step6" element={<Step6Checkout />} /> */}
        {/* Fallback to step1 if no subpath */}
        <Route index element={null} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
