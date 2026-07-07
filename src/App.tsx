import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CustomCursor } from "@/components/site/CustomCursor";
import { Toaster } from "@/components/ui/sonner";

// Import all routes directly
import Home from "./routes/index";
import About from "./routes/about";
import Projects from "./routes/projects";
import ProjectDetail from "./routes/projects.$slug";
import DesignStudio from "./routes/design-studio";
import Services from "./routes/services";
import Testimonials from "./routes/testimonials";
import Contact from "./routes/contact";
import Admin from "./routes/admin";

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

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/design-studio" element={<DesignStudio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFoundComponent />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
      <CustomCursor />
      <Toaster />
    </div>
  );
}
