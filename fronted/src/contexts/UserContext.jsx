import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState({
    username: '',
    email: '',
    gender: '',
    userId: 0,
    fullName: ''
  });

  const updateUser = (userInfo) => {
    const {username, email, gender, user_id:userId, full_name:fullName} = userInfo;
    setUser({
      username,
      email,
      gender,
      userId,
      fullName
    });

  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => useContext(UserContext);