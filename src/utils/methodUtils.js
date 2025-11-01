// Safe helpers to normalize payment method fields which may be strings or React nodes
export function methodToString(method) {
  if (!method) return "";
  if (typeof method === "string") return method;
  try {
    // React element: attempt to extract children text
    const children = method.props && method.props.children;
    if (!children) return "";
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children
        .map((c) => (typeof c === "string" ? c : c?.props?.children || ""))
        .join(" ")
        .trim();
    }
    return children?.props?.children || "";
  } catch (e) {
    return "";
  }
}

export function methodToLower(method) {
  try {
    return (methodToString(method) || "").toLowerCase();
  } catch (e) {
    return "";
  }
}
