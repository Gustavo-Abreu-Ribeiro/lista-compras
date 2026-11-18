import { createBrowserRouter } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import GameLayout from "../layout/GameLayout"
import LoginLayout from "../layout/LoginLayout"
import SettingsLayout from "../layout/SettingsLayout"
import FinanceLayout from "../layout/FinanceLayout"
import FinanceDebtsLayout from "../layout/FinanceDebtsLayout"
import HomeLayout from "../layout/HomeLayout"
import RequireAuth from "../layout/RequireAuth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RequireAuth><HomeLayout /></RequireAuth>,
  },
  {
    path: "/shopping",
    element: <RequireAuth><AppLayout /></RequireAuth>,
  },
  {
    path: "/games",
    element: <RequireAuth><GameLayout /></RequireAuth>,
  },
  {
    path: "/login",
    element: <LoginLayout />,
  },
  {
    path: "/settings",
    element: <RequireAuth><SettingsLayout /></RequireAuth>,
  },
  {
    path: "/finance",
    element: <RequireAuth><FinanceLayout /></RequireAuth>,
  },
  {
    path: "/finance/debts",
    element: <RequireAuth><FinanceDebtsLayout /></RequireAuth>,
  },
])
