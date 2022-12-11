import type {
  LinksFunction,
  MetaFunction,
  ErrorBoundaryComponent,
} from "@remix-run/node";
import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  useCatch,
  Link,
} from "@remix-run/react";
import { FiMonitor } from "react-icons/fi";
import { IoStatsChart, IoWalletOutline } from "react-icons/io5";
import { MdViewList, MdOutlineWindow } from "react-icons/md";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import logoUrl from "./assets/logo.svg";
import ThemeToggle from "./components/UI/ThemeToggle";
import {
  ThemeProvider,
  useTheme,
  AddThemeBeforeHydration,
} from "~/utils/theme-context";
import clsx from "clsx";

type Props = {
  children?: React.ReactNode;
};

export const links: LinksFunction = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Sublimetrack",
  viewport: "width=device-width,initial-scale=1",
});

export default function AppWithThemeProvider() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({ children }: Props) {
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <Links />
        <AddThemeBeforeHydration />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Layout({ children }: Props) {
  const [theme, setTheme] = useTheme();

  return (
    <div className="page-container flex">
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <NavPanel />
      <main className="main-container p-5">{children}</main>
    </div>
  );
}

function NavPanel() {
  const activeClassName = "active-navlink";

  const navLinks = [
    {
      to: "/",
      icon: <FiMonitor className="nav-icon" />,
      text: "Overview",
    },
    {
      to: "/expenses",
      icon: <MdViewList className="nav-icon" />,
      text: "Expenses",
    },
    {
      to: "/budgets",
      icon: <IoWalletOutline className="nav-icon" />,
      text: "Budgets",
    },
    {
      to: "/categories",
      icon: <MdOutlineWindow className="nav-icon" />,
      text: "Categories",
    },
    {
      to: "/insights",
      icon: <IoStatsChart className="nav-icon" />,
      text: "Insights",
    },
  ];

  return (
    <div className="nav-panel flex-column align-center py-3">
      <div className="logo-container flex-column align-center">
        <img className="logo" src={logoUrl} alt="Sublimetrack Logo" />
        <h1 className="hidden-mobile">
          sublime<span className="title-highlight">track</span>
        </h1>
      </div>
      <nav className="nav my-2">
        <ul>
          {navLinks.map((link) => (
            <li className="my-1" key={link.text}>
              <NavLink
                to={link.to}
                prefetch="intent"
                className={({ isActive }) =>
                  isActive ? activeClassName : undefined
                }
              >
                {link.icon}
                <span className="hidden-mobile">{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

//for unexpected errors
export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <ThemeProvider>
      <Document>
        <Layout>
          <div className="error-boundary flex-column align-center justify-center">
            <h1>Oops...something went wrong</h1>
            <p className="my-1">{error.message}</p>
          </div>
        </Layout>
      </Document>
    </ThemeProvider>
  );
};

//for expected errors like 404
export function CatchBoundary() {
  const caught = useCatch();

  //the message we provide to the thrown response is available on caught.data
  const errorMessage = caught.data ?? "Page not found";

  return (
    <ThemeProvider>
      <Document>
        <Layout>
          <div className="catch-boundary flex-column align-center justify-center">
            <h1>{caught.status}</h1>
            <p>{errorMessage}</p>
            <Link to="/" className="btn btn-primary my-2">
              Home Page
            </Link>
          </div>
        </Layout>
      </Document>
    </ThemeProvider>
  );
}
