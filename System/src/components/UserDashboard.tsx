import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface UserDashboardProps {
  userId?: string;
}

/**
 * Iframe wrapper to host the user-facing dashboard.
 * Expects the static build to be available at /drivecash-dashboard/index.html
 */
const UserDashboard: React.FC<UserDashboardProps> = ({ userId = "" }) => {
  const navigate = useNavigate();
  const params = useParams<{ view?: string }>();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const view = params.view || qs.get("view") || "dashboard";
  const uid = userId || qs.get("userId") || "";
  // Pass authentication context to the iframe
  const authToken =
    localStorage.getItem("drivecash_admin_token") ||
    localStorage.getItem("authToken");
  const userEmail = localStorage.getItem("drivecash_user_email");
  const src = `/drivecash-dashboard/index.html?view=${encodeURIComponent(
    view as string
  )}&userId=${encodeURIComponent(uid as string)}&token=${encodeURIComponent(
    authToken || ""
  )}&email=${encodeURIComponent(userEmail || "")}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement("style");
          style.textContent = `
					  /* Hide header/footer in various frameworks */
					  header, footer,
					  [role="banner"], [role="contentinfo"],
					  .app-header, .app-footer,
					  .layout-header, .layout-footer,
					  .main-header, .main-footer,
					  .MuiAppBar-root, .MuiToolbar-root,
					  .md-header, .md-footer,
					  #header, #footer,
					  .footer, .copyright,
					  .navbar, .navbar-fixed-top, .navbar-fixed-bottom,
					  .site-header, .site-footer {
					    display: none !important; visibility: hidden !important;
					    height: 0 !important; min-height: 0 !important;
					    margin: 0 !important; padding: 0 !important;
					  }

					  /* Hide role switching affordances - be more specific to avoid hiding legitimate buttons */
					  button[aria-label*="Switch to Admin"], button[aria-label*="Switch to User"],
					  button[title*="Switch to Admin"], button[title*="Switch to User"],
					  button[aria-label*="Admin Switch"], button[aria-label*="User Switch"],
					  button[title*="Admin Switch"], button[title*="User Switch"],
					  .role-switch, .admin-toggle, .user-toggle,
					  .impersonate-btn, .switch-role, .role-switcher,
					  .admin-switcher, .user-switcher,
					  [data-testid="role-switch"], [data-testid="admin-switch"], [data-testid="user-switch"],
					  [class*="roleSwitch"], [class*="adminToggle"], [class*="userToggle"],
					  [class*="role-switch"], [class*="admin-toggle"], [class*="user-toggle"],
					  .toggle-role, .role-selector, .admin-selector, .user-selector,
					  button[aria-label="Impersonate"], button[title="Impersonate"],
					  [aria-label*="impersonate"], [title*="impersonate"] {
					    display: none !important; visibility: hidden !important;
					  }
					  
					  /* Ensure buttons maintain pointer events */
					  button:not(.role-switch):not(.admin-toggle):not(.user-toggle) {
					    pointer-events: auto !important;
					  }
					  
					  /* Debug: highlight buttons to check if they're being hidden */
					  button {
					    outline: 1px solid rgba(255, 0, 0, 0.2) !important;
					  }
					  
					  /* Ensure overlays don't block clicks */
					  .css-10d9dml, .MuiBackdrop-root:not(.MuiBackdrop-invisible) {
					    pointer-events: none !important;
					  }

					  /* Normalize height */
					  html, body, #root, main { height: 100% !important; min-height: 100% !important; }
					`;
          iframeDoc.head.appendChild(style);

          const script = iframeDoc.createElement("script");
          script.type = "text/javascript";
          script.textContent = `(() => {
					  const textMatchers = [
					    /\\bSwitch\\s+(to\\s+)?(Admin|User)\\b/i,
					    /\\b(Admin|User)\\s+Switch\\b/i, 
					    /\\bImpersonate\\b/i,
					    /\\bSwitch\\s+Role\\b/i,
					    /\\bRole\\s+Switch\\b/i
					  ];
					  function matchesText(node){ const t=(node.textContent||'').trim(); return t && textMatchers.some(rx=>rx.test(t)); }
					  function hideIfMatch(el){ try{ if(el.nodeType!==Node.ELEMENT_NODE) return; if(matchesText(el)){ el.style.setProperty('display','none','important'); el.style.setProperty('visibility','hidden','important'); } } catch(e){} }
					  const candidates=Array.from(document.querySelectorAll('button,a,li[role="menuitem"],.MuiMenuItem-root')); candidates.forEach(hideIfMatch);
					  const mo=new MutationObserver(m=>{ for(const x of m){ if(x.type==='childList'){ x.addedNodes&&x.addedNodes.forEach(n=>{ if(n.nodeType===Node.ELEMENT_NODE){ hideIfMatch(n); Array.from((n).querySelectorAll&& (n).querySelectorAll('button,a,li[role="menuitem"],.MuiMenuItem-root')||[]).forEach(hideIfMatch); } }); } if(x.type==='attributes'&&x.target) hideIfMatch(x.target); } });
					  mo.observe(document.documentElement||document.body,{ childList:true, subtree:true, attributes:true, attributeFilter:['class','aria-label','title'] });
					  
					  // Debug: Add click logging to all buttons
					  document.addEventListener('click', function(e) {
					    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
					      console.log('Button clicked:', e.target, 'Text:', e.target.textContent);
					    }
					  }, true);
					  
					  // Debug: Check for disabled buttons
					  setTimeout(() => {
					    const allButtons = document.querySelectorAll('button');
					    console.log('Total buttons found:', allButtons.length);
					    const disabledButtons = document.querySelectorAll('button:disabled, button[aria-disabled="true"]');
					    console.log('Disabled buttons:', disabledButtons.length);
					    const hiddenButtons = Array.from(allButtons).filter(b => 
					      getComputedStyle(b).display === 'none' || 
					      getComputedStyle(b).visibility === 'hidden' ||
					      b.style.display === 'none'
					    );
					    console.log('Hidden buttons:', hiddenButtons.length);
					  }, 1000);
					})();`;
          iframeDoc.head.appendChild(script);

          // Load the button fix script
          const fixScript = iframeDoc.createElement("script");
          fixScript.src = "/dashboard-button-fix.js";
          fixScript.onload = () =>
            console.log("Dashboard button fix script loaded");
          fixScript.onerror = () =>
            console.warn("Failed to load dashboard button fix script");
          iframeDoc.head.appendChild(fixScript);

          // Add authentication bridge script
          const authBridge = iframeDoc.createElement("script");
          authBridge.textContent =
            "// Bridge for authentication and navigation\\n" +
            'window.parentAuthToken = "' +
            (authToken || "") +
            '";\\n' +
            'window.parentUserEmail = "' +
            (userEmail || "") +
            '";\\n' +
            "\\n" +
            "// Setup authentication headers for API calls\\n" +
            "if (window.fetch) {\\n" +
            "  const originalFetch = window.fetch;\\n" +
            "  window.fetch = function(...args) {\\n" +
            '    if (args[1] && typeof args[1] === "object") {\\n' +
            "      args[1].headers = {\\n" +
            "        ...args[1].headers,\\n" +
            '        "Authorization": window.parentAuthToken ? "Bearer " + window.parentAuthToken : undefined\\n' +
            "      };\\n" +
            "    }\\n" +
            "    return originalFetch.apply(this, args);\\n" +
            "  };\\n" +
            "}\\n" +
            "\\n" +
            "// Log iframe ready state\\n" +
            'console.log("[Dashboard Bridge] Authentication context set up");\\n' +
            'console.log("[Dashboard Bridge] Token available:", !!window.parentAuthToken);\\n' +
            'console.log("[Dashboard Bridge] User email:", window.parentUserEmail);';
          iframeDoc.head.appendChild(authBridge);

          const handleLogout = (event: MessageEvent) => {
            if (event.data === "logout" || event.data?.type === "logout") {
              localStorage.removeItem("drivecash_isAdmin");
              navigate("/");
            }
          };
          window.addEventListener("message", handleLogout);
          return () => window.removeEventListener("message", handleLogout);
        }
      } catch {
        console.log(
          "CSS injection blocked by CORS policy - this is normal for security"
        );
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [navigate, authToken, userEmail]);

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)]">
      <iframe
        ref={iframeRef}
        title="DriveCash User Dashboard"
        src={src}
        className="w-full h-full border-0"
        style={{ minHeight: "calc(100vh - 4rem)" }}
      />
    </div>
  );
};

export default UserDashboard;
