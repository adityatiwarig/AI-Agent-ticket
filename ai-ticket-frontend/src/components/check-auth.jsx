import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckAuth({ children, protected: isProtected, adminOnly = false }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (isProtected && !token) {
      navigate("/login");
      return;
    }

    if (adminOnly && user?.role !== "admin") {
      navigate("/");
      return;
    }
  }, [navigate, isProtected, adminOnly]);

  return children;
}
