import { Link, NavLink, useLocation } from "react-router-dom"

const primaryLinks = [
  { to: "/", label: "Início", icon: "01", end: true },
  { to: "/shopping", label: "Compras", icon: "02" },
  { to: "/games", label: "Jogos", icon: "03" },
  { to: "/finance", label: "Finanças", icon: "04" },
]

function navClass(isActive: boolean, baseClass: string) {
  return `${baseClass}${isActive ? " is-active" : ""}`
}

function AeroIcon({ destination }: { destination: string }) {
  const paths: Record<string, string> = {
    "/": "M4 11 12 4l8 7M7 10v10h10V10M10 20v-6h4v6",
    "/shopping": "M4 8h16l-2 12H6L4 8ZM8 8l4-5 4 5M9 12v4m6-4v4",
    "/games": "M8 8h8c3 0 5 4 5 8 0 3-3 3-5 0H8c-2 3-5 3-5 0 0-4 2-8 5-8ZM6 12h4m-2-2v4m8-3h.1m2 2h.1",
    "/finance": "M5 20V11h3v9m3 0V5h3v15m3 0V8h3v12",
  }
  return <span className="aero-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d={paths[destination]} /></svg></span>
}

export default function AppNavigation() {
  const { pathname } = useLocation()

  return <>
    <nav className="top-nav app-navigation" aria-label="Navegação principal">
      <Link className="brand" to="/" aria-label="Lista — início">
        <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><path d="M5 12h22l-2 15H7L5 12Z M4 12h24 M11 12l3-6 M21 12l-3-6 M11 17v6 M16 17v6 M21 17v6" /></svg></span>
        <span className="brand-name">Lista de casa <small className="cartucho-brand-code" aria-hidden="true">[ 家計簿 ]</small></span>
      </Link>
      <div className="nav-links nav-primary">
        {primaryLinks.map((link) => <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => navClass(isActive, "btn nav-tab")}
        ><span className="nav-icon" aria-hidden="true">{link.icon}</span><AeroIcon destination={link.to} /><span>{link.label}</span></NavLink>)}
      </div>
      <NavLink to="/settings" className={({ isActive }) => navClass(isActive || pathname === "/login", "btn btn-ghost nav-settings")}>
        <span className="cartucho-settings-number" aria-hidden="true">05 </span>Ajustes
      </NavLink>
      <span className="cartucho-barcode" aria-hidden="true" />
    </nav>
    <nav className="bottom-nav app-bottom-nav" aria-label="Áreas do app">
      {primaryLinks.map((link) => <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) => navClass(isActive, "nav-link")}
      ><span className="nav-icon" aria-hidden="true">{link.icon}</span><AeroIcon destination={link.to} /><span>{link.label}</span></NavLink>)}
    </nav>
  </>
}
