import {
  BellOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.jpg";
import { Popover } from "antd";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../services/api.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, setUser, cart, setIsAppLoading, setCart } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const content = (
    <div>
      <h2>Tiếng Việt</h2>
      <h2>Tiếng Anh</h2>
    </div>
  );

  const [showMenu, setShowMenu] = useState(false);

  const logout = async () => {
    setIsAppLoading(true);
    const res = await logoutApi();
    if (res.data.success === true) {
      toast.success(res.message);
      setUser(null);
      setCart(null);
      localStorage.removeItem("token");
      navigate("/");
    } else {
      toast.error("Đăng xuất thất bại");
    }
    setIsAppLoading(false);
  };
  return (
    <>
      <div className="header flex justify-center">
        <div
          className="w-[1170px] flex "
          style={{
            height: "72px",
            padding: "1rem",
          }}
        >
          <div className="flex-1 flex justify-start items-center">
            <h3>Bạn đang ở đâu ?</h3>
          </div>
          <div className="flex-1 flex justify-center items-center ">
            <Link to="/">
              <img
                src={logo}
                alt=""
                style={{
                  height: "42px",
                  margin: "0 auto ",
                  lineHeight: "100%",
                }}
              />
            </Link>
          </div>
          <div className="flex-1  flex justify-end items-center gap-6">
            <BellOutlined
              style={{
                fontSize: "1.5rem",
              }}
            />
            <Popover
              content={content}
              className="w-[28px] text-center text-[#1da1f2] font-bold"
            >
              VI
            </Popover>
            <Link to="/cart">
              <div
                className="cart flex "
                style={{
                  fontSize: "1.2rem",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  borderRadius: "50px",
                  height: "40px",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                  }}
                >
                  {cart?.items?.length || 0}
                </span>
                <ShoppingCartOutlined className="ml-2" />
              </div>
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div
                className="info flex"
                style={{
                  fontSize: "1.2rem",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  borderRadius: "50px",
                  height: "40px",
                  cursor: "pointer",
                }}
              >
                <UnorderedListOutlined style={{ fontSize: "1rem" }} />
                <UserOutlined className="ml-2" />
              </div>

              {showMenu && (
                <div
                  style={{
                    transition: "1s",
                  }}
                  className="w-[210px] DropDownMenu absolute top-full right-0 bg-white shadow-xl z-10 duration-200 rounded-xl"
                >
                  {!user?.id ? (
                    <>
                      <a
                        href="/login"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 md:block hover:font-bold hover:text-[#1da1f2] cursor-pointer m-0"
                      >
                        Đăng nhập
                      </a>
                      <a
                        href="/register"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer m-0"
                      >
                        Đăng ký
                      </a>
                    </>
                  ) : (
                    <>
                      <Link to="/info">
                        <div className="p-4 border-b border-gray-200">
                          <p className="font-bold">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </Link>
                      <Link
                        to="/order"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer"
                      >
                        Theo dõi đơn hàng
                      </Link>
                    </>
                  )}

                  <div className="bg-gray-300 w-full h-[1px]" />

                  <a
                    href="#"
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer"
                  >
                    Đỗi điểm
                  </a>
                  <a
                    href="#"
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer"
                  >
                    Hut Rewards
                  </a>
                  <a
                    href="#"
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer"
                  >
                    Hỗ trợ khách hàng
                  </a>

                  {user?.id && (
                    <>
                      <div className="bg-gray-300 w-full h-[1px]" />
                      <button
                        onClick={logout}
                        className="w-full text-left duration-100 py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-[#1da1f2] cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
