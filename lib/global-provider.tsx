import { getCurrentUser } from "@/services/appwrite";
import React, { createContext, useContext, useEffect, useState } from "react";

interface GlobalContextType {
  isLogged: boolean;
  user: any;
  loading: boolean;
  refetch: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      if (res) {
        setIsLogged(true);
        setUser(res);
      } else {
        setIsLogged(false);
        setUser(null);
      }
    } catch (error) {
      console.log("Error getting user:", error);
      setIsLogged(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;
