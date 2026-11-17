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
        ><span className="nav-icon" aria-hidden="true">{link.icon}</span><span>{link.label}</span></NavLink>)}
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
      ><span className="nav-icon" aria-hidden="true">{link.icon}</span><span>{link.label}</span></NavLink>)}
    </nav>
  </>
}
