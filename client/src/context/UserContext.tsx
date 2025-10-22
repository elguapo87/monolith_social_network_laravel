import { createContext } from "react";

interface UserContextType {

}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider = ({ children } : { children: React.ReactNode }) => {

    const value = {};

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};

export default UserContextProvider;