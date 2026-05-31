"use client";

import { useEffect } from "react";

export function PasswordRecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const query = window.location.search;
    const hasRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token=");
    const hasRecoveryQuery = query.includes("type=recovery") || query.includes("code=");

    if (hasRecoveryHash || hasRecoveryQuery) {
      window.location.replace(`/actualizar-contrasena${query}${hash}`);
    }
  }, []);

  return null;
}
