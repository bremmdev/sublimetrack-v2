import type { LinksFunction, MetaFunction } from "@remix-run/node";
import React from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
} from "@remix-run/react";
import { FiMonitor } from "react-icons/fi";
import { IoStatsChart, IoWalletOutline } from "react-icons/io5";
import { MdViewList, MdOutlineWindow } from "react-icons/md";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import logoUrl from "./assets/logo.svg";

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

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function Layout({ children }: Props) {
  return (
    <div className="page-container flex">
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
      to: "/budgets",
      icon: <IoWalletOutline className="nav-icon" />,
      text: "Budgets",
    },
    {
      to: "/expenses",
      icon: <MdViewList className="nav-icon" />,
      text: "Expenses",
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
