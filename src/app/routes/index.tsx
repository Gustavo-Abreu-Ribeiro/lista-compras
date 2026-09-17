import { createBrowserRouter, Navigate } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import GameLayout from "../layout/GameLayout"
import LoginLayout from "../layout/LoginLayout"
import SettingsLayout from "../layout/SettingsLayout"
import FinanceLayout from "../layout/FinanceLayout"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
  },
  {
    path: "/shopping",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/games",
    element: <GameLayout />,
  },
  {
    path: "/login",
    element: <LoginLayout />,
  },
  {
    path: "/settings",
    element: <SettingsLayout />,
  },
  {
    path: "/finance",
    element: <FinanceLayout />,
  },
])
