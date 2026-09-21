import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../helpers/ProtectedRoute";
import { AuthLayout } from "../components/Layouts/AuthLayout";
import LivescreenLayout from "../components/Layouts/LivescreenLayout";
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import NewLiveScreen from "../pages/main";
import SoundSensorPage from "../pages/livescreen/Sound";
import GasPage from "../pages/livescreen/Gas";
import LidarPage from "../pages/livescreen/Lidar";
import ThermalPage from "../pages/livescreen/Camera";
import WitPage from "../pages/livescreen/Wit";
import AdxlPage from "../pages/livescreen/Adxl";
import MpuPage from "../pages/livescreen/Mpu";
import BmePage from "../pages/livescreen/Bme";
import LoadcellPage from "../pages/livescreen/Loadcell";
import SmartskinPage from "../pages/livescreen/Smartskin";
import SmartskinDetailPage from "../pages/livescreen/SmartskinDetail";
import TeamPage from "../pages/livescreen/Team";
import PageNotFound from "../pages/error/NotFound";

const sensorChildren = [
  {
    path: "sound",
    element: (
      <ProtectedRoute>
        <SoundSensorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "gas",
    element: (
      <ProtectedRoute>
        <GasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "lidar",
    element: (
      <ProtectedRoute>
        <LidarPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "camera",
    element: (
      <ProtectedRoute>
        <ThermalPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "wit",
    element: (
      <ProtectedRoute>
        <WitPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "adxl",
    element: (
      <ProtectedRoute>
        <AdxlPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "mpu6050",
    element: (
      <ProtectedRoute>
        <MpuPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "bme",
    element: (
      <ProtectedRoute>
        <BmePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "loadcell",
    element: (
      <ProtectedRoute>
        <LoadcellPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "smartskin",
    element: (
      <ProtectedRoute>
        <SmartskinPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "smartskin/:sensorKey",
    element: (
      <ProtectedRoute>
        <SmartskinDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "skin",
    element: <Navigate to="/sensor/smartskin" replace />,
  },
];

const router = createBrowserRouter([
  {
    path: "*",
    element: <PageNotFound />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LivescreenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: (
          <ProtectedRoute>
            <NewLiveScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "team",
        element: (
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sensor",
        children: sensorChildren,
      },
    ],
  },

  {
    path: ":id",
    element: <LivescreenLayout />,
    children: [
      {
        path: "",
        element: (
          <ProtectedRoute>
            <NewLiveScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "team",
        element: (
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sensor",
        children: sensorChildren,
      },
    ],
  },
]);

export default router;
