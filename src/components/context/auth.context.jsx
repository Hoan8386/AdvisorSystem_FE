import { createContext, useState, useEffect } from "react";
import { getAccountAPI, logoutApi } from "../../services/api.service";

const AuthContext = createContext({
  id: null,
  email: "",
  full_name: "",
  address: "",
  phone: "",
  role: "",
});

const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    email: "",
    full_name: "",
    address: "",
    phone: "",
    role: "",
    advisor: null,
    classes: [],
  });

  const [isAppLoading, setIsAppLoading] = useState(true);

  const [cart, setCart] = useState({
    id: 0,
    user_id: null, // nếu muốn lưu cả id user
    totalItems: 0,
    totalPrice: 0,
    items: [], // đảm bảo luôn có mảng rỗng
  });

  // Handle login by saving token and user info
  const handleLogin = (loginData) => {
    // loginData expected shape: { token, user } where user has advisor, classes, etc.
    if (!loginData) return;
    try {
      // Handle token
      if (loginData.token) {
        window.localStorage.setItem("access_token", loginData.token);
      }

      // Get user data
      const u = loginData.user || loginData;

      // Save entire user object to preserve nested data (advisor, classes, etc)
      setUser((prev) => ({
        ...prev,
        id: u.user_id ?? u.id ?? prev.id,
        email: u.email ?? prev.email,
        full_name: u.full_name ?? prev.full_name,
        address: u.address ?? prev.address,
        phone: u.phone_number ?? u.phone ?? prev.phone,
        role: u.role ?? prev.role,
        // Store full user object for nested data access
        advisor: u.advisor ?? prev.advisor,
        classes: u.classes ?? prev.classes,
      }));
    } catch (e) {
      console.error("handleLogin error", e);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server session
      await logoutApi();
    } catch {
      // Continue logout locally even if API fails
    } finally {
      // Clear token and user state locally
      window.localStorage.removeItem("access_token");
      setUser({
        id: null,
        email: "",
        full_name: "",
        address: "",
        phone: "",
        role: "",
        advisor: null,
        classes: [],
      });
    }
  };

  // On mount: if token exists, try to fetch current account
  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem("access_token");
      if (!token) {
        setIsAppLoading(false);
        return;
      }

      try {
        const res = await getAccountAPI();
        // getAccountAPI returns the `data` payload per axios.customize
        if (res && res.user_id) {
          setUser({
            id: res.user_id,
            email: res.email ?? "",
            full_name: res.full_name ?? "",
            address: res.address ?? "",
            phone: res.phone ?? "",
            role: res.role ?? "",
          });
        } else if (res && res.data && res.data.user_id) {
          const d = res.data;
          setUser({
            id: d.user_id,
            email: d.email ?? "",
            full_name: d.full_name ?? "",
            address: d.address ?? "",
            phone: d.phone ?? "",
            role: d.role ?? "",
          });
        }
      } catch (e) {
        console.warn("Failed to fetch account, clearing token", e);
        window.localStorage.removeItem("access_token");
      } finally {
        setIsAppLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAppLoading,
        setIsAppLoading,
        cart,
        setCart,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthWrapper };
