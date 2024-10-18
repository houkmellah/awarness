import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuthStore from "../store";

const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
      if (!token) {
        router.replace("/auth");
      } else {
        setIsAuthenticated(true);
      }
    }, [token, router]);

    if (!isAuthenticated) {
      return null; // Ou un composant de chargement si vous préférez
    }

    return <WrappedComponent {...props} />;
  };

  // Copie le displayName pour une meilleure débogage
  AuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthWrapper;
};

export default withAuth;