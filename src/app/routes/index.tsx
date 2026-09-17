import { createBrowserRouter } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import IntroLayout from "../layout/IntroLayout"
import GameLayout from "../layout/GameLayout"
import LoginLayout from "../layout/LoginLayout"
import SettingsLayout from "../layout/SettingsLayout"
import FinanceLayout from "../layout/FinanceLayout"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <IntroLayout />,
  },
  {
    path: "/shopping",
    element: <AppLayout />,
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
