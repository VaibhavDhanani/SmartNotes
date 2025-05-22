import { createContext, useContext, useEffect, useState } from "react";
import { getUser, verifyToken } from "../service/auth.service";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    username: "",
    email: "",
    gender: "",
    userId: -1,
    fullName: "",
  });

  useEffect(() => {
    const initializeUser = async () => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (token) {
        const data = await verifyToken(token);
        // console.log(data.username)
          const userInfo = await getUser(data.username);
          // console.log(userInfo)
          updateUser(userInfo);
          setIsAuthenticated(true);
          if (data.newToken) {
            localStorage.setItem("token", data.newToken);
          }
          setLoading(false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error(err.response.data.detail);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };
    initializeUser();
  }, []);

  const updateUser = (userInfo) => {
    const {
      username,
      email,
      gender,
      user_id: userId,
      full_name: fullName,
    } = userInfo;
    setUser({
      username,
      email,
      gender,
      userId,
      fullName,
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isAuthenticated, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
