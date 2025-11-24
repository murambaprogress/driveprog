import React, { useEffect, useMemo, useRef } from "react";

const LegacyLogin: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = useMemo(() => {
    // Use internal route when running combined dev server so the dashboard
    // login is served from the same port under /login
    if (import.meta.env.DEV) {
      return "/login";
    }
    return "/legacy";
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data === "login-success" ||
        event.data?.type === "login-success"
      ) {
        window.location.href = "/";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-full min-h-0">
        <iframe
          ref={iframeRef}
          title="DriveCash Legacy Login"
          src={src}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default LegacyLogin;
