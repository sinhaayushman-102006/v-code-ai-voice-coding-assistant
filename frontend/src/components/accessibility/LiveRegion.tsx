import { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

// A single shared aria-live region for status announcements (NOT for
// spoken TTS -- that's separate). This lets screen reader users get text
// announcements even with speakers muted, without every component
// rendering its own live region and causing duplicate/overlapping output.

let externalAnnounce: ((msg: string, urgent?: boolean) => void) | null = null;

export function announce(message: string, urgent = false) {
  externalAnnounce?.(message, urgent);
}

export default function LiveRegion() {
  const enabled = useSettingsStore((s) => s.screenReaderAnnouncements);
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  useEffect(() => {
    externalAnnounce = (msg, urgent) => {
      if (!enabled) return;
      if (urgent) {
        setAssertive("");
        requestAnimationFrame(() => setAssertive(msg));
      } else {
        setPolite("");
        requestAnimationFrame(() => setPolite(msg));
      }
    };
    return () => {
      externalAnnounce = null;
    };
  }, [enabled]);

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
    </>
  );
}
