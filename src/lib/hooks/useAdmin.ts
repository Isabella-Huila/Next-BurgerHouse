import { useAppSelector } from "./redux";

export const useAdmin = () => {
  const { user } = useAppSelector((state) => state.auth);

  const isAdmin = user?.roles?.includes("admin") || false;

  return {
    isAdmin,
    user,
  };
};
