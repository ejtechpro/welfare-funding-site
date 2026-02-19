import type { ReactNode } from "react";
import { createPortal } from "react-dom";

function TnsLoading({ children }: { children: ReactNode }) {
  const portalRoot = document.getElementById("portal")!;
  return createPortal(children, portalRoot);
}

export default TnsLoading;
