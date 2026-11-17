import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "./app/routes"
import { startPriceRefreshSchedule } from "./features/itemLinks/api"
import "./app.css"
import "./styles/cartucho.css"

const savedTheme = localStorage.getItem("lista-compras:theme")
if (savedTheme) document.documentElement.dataset.theme = savedTheme

startPriceRefreshSchedule()

const isAndroid = /Android/i.test(navigator.userAgent)
if (isAndroid) {
  document.documentElement.classList.add("platform-android")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
