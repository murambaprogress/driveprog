/**
 * Dashboard Button Click Fix
 * 
 * This script fixes button click issues in the DriveCash dashboard
 * by addressing CSS conflicts and JavaScript interference
 */

// Function to check and fix button click issues
function fixDashboardButtons() {
    console.log('[Dashboard Fix] Checking button functionality...');

    // 1. Remove overly broad CSS rules that might be blocking buttons
    const problematicStyles = document.querySelectorAll('style');
    problematicStyles.forEach(style => {
        if (style.textContent.includes('display: none !important') &&
            style.textContent.includes('.MuiMenuItem-root')) {
            console.log('[Dashboard Fix] Removing problematic style:', style.textContent.substring(0, 100));
            // Comment out the problematic rule instead of removing the whole style
            style.textContent = style.textContent.replace(
                /\.MuiMenuItem-root[^}]*display:\s*none\s*!important[^}]*}/gi,
                '/* Commented out problematic rule: .MuiMenuItem-root { display: none !important; } */'
            );
        }
    });

    // 2. Ensure all buttons have proper pointer events
    const allButtons = document.querySelectorAll('button, [role="button"]');
    console.log(`[Dashboard Fix] Found ${allButtons.length} buttons`);

    let fixedCount = 0;
    allButtons.forEach((button, index) => {
        const computedStyle = getComputedStyle(button);

        // Check if button is being blocked
        if (computedStyle.pointerEvents === 'none' ||
            computedStyle.display === 'none' ||
            computedStyle.visibility === 'hidden') {

            // Only fix if it doesn't look like a role-switching button
            const buttonText = button.textContent?.toLowerCase() || '';
            const isRoleSwitch = buttonText.includes('switch to admin') ||
                buttonText.includes('switch to user') ||
                buttonText.includes('impersonate') ||
                button.classList.contains('role-switch');

            if (!isRoleSwitch) {
                button.style.setProperty('pointer-events', 'auto', 'important');
                button.style.setProperty('display', 'flex', 'important');
                button.style.setProperty('visibility', 'visible', 'important');
                fixedCount++;
                console.log(`[Dashboard Fix] Fixed button ${index}:`, buttonText.substring(0, 30));
            }
        }
    });

    console.log(`[Dashboard Fix] Fixed ${fixedCount} buttons`);

    // 3. Add click event debugging
    document.addEventListener('click', function (e) {
        if (e.target.matches('button, [role="button"]') || e.target.closest('button')) {
            console.log('[Dashboard Fix] Button clicked:', {
                element: e.target,
                text: e.target.textContent?.substring(0, 50),
                disabled: e.target.disabled,
                pointerEvents: getComputedStyle(e.target).pointerEvents,
                display: getComputedStyle(e.target).display
            });
        }
    }, true);

    // 4. Fix any Material-UI backdrop issues
    const backdrops = document.querySelectorAll('.MuiBackdrop-root');
    backdrops.forEach(backdrop => {
        if (!backdrop.classList.contains('MuiBackdrop-invisible')) {
            backdrop.style.setProperty('pointer-events', 'none', 'important');
        }
    });

    return {
        buttonsFound: allButtons.length,
        buttonsFixed: fixedCount,
        backdropsFixed: backdrops.length
    };
}

// Function to monitor and fix buttons continuously
function startButtonMonitoring() {
    console.log('[Dashboard Fix] Starting button monitoring...');

    // Initial fix
    setTimeout(fixDashboardButtons, 100);

    // Monitor for new buttons added dynamically
    const observer = new MutationObserver((mutations) => {
        let hasNewButtons = false;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newButtons = node.querySelectorAll ?
                            node.querySelectorAll('button, [role="button"]') : [];
                        if (newButtons.length > 0 || node.matches('button, [role="button"]')) {
                            hasNewButtons = true;
                        }
                    }
                });
            }
        });

        if (hasNewButtons) {
            console.log('[Dashboard Fix] New buttons detected, re-fixing...');
            setTimeout(fixDashboardButtons, 50);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic check every 5 seconds
    setInterval(() => {
        const stats = fixDashboardButtons();
        if (stats.buttonsFixed > 0) {
            console.log('[Dashboard Fix] Periodic fix applied:', stats);
        }
    }, 5000);
}

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startButtonMonitoring);
} else {
    startButtonMonitoring();
}

// Export for manual use
window.dashboardButtonFix = {
    fix: fixDashboardButtons,
    startMonitoring: startButtonMonitoring
};