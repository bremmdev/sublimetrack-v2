import { RemixBrowser } from "@remix-run/react";
// import { hydrateRoot } from "react-dom/client";

// hydrateRoot(document, <RemixBrowser />);

require("react-dom").hydrate(<RemixBrowser />, document);
