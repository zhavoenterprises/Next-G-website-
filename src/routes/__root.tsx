import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-4 text-center">
      <div className="mono-label text-orange">◤ Error 404</div>
      <h1 className="mt-3 font-display text-6xl font-bold text-navy">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you're looking for isn't on our drawings.
      </p>
      <a href="/" className="btn-primary mt-6">Return home</a>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-4 text-center">
      <div className="mono-label text-orange">◤ Something broke</div>
      <h1 className="mt-3 font-display text-3xl font-bold text-navy">This page didn't load</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Try refreshing or head back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary">Try again</button>
        <a href="/" className="btn-ghost text-navy">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NG · Next G Engineers Promoters — Construction & Real Estate, Madurai" },
      { name: "description", content: "Madurai-based construction and real estate development firm delivering residential, commercial and plotted projects with 11+ years of engineering discipline." },
      { name: "author", content: "Next G Engineers Promoters Pvt Ltd" },
      { property: "og:title", content: "NG · Next G Engineers Promoters" },
      { property: "og:description", content: "Building Madurai's future with precision, integrity and lasting value." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Next G Engineers Promoters Pvt Ltd" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0D0B1F" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-offwhite">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </QueryClientProvider>
  );
}
