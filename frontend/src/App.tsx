import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import SkipLinks from "./components/accessibility/SkipLinks";
import LiveRegion from "./components/accessibility/LiveRegion";
import Workspace from "./pages/Workspace";
import Tutor from "./pages/Tutor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useSettingsStore } from "./stores/settingsStore";

function AppShell() {
  const { highContrast, reducedMotion, fontSize } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
    document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`);
  }, [highContrast, reducedMotion, fontSize]);

  return (
    <>
      <SkipLinks />
      <Header isListening={false} />
      <LiveRegion />
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
