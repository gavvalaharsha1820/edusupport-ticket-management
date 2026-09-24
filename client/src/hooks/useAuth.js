import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return { user, setUser, loading, setLoading, logout };
}
