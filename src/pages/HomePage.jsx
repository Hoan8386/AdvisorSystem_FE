import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Nếu chưa đăng nhập, chuyển hướng đến login
    if (!user?.user_id) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h1>Chào mừng {user?.full_name || "bạn"}</h1>
      <p>Đây là trang chủ của hệ thống cố vấn học tập</p>
    </div>
  );
};

export default HomePage;
