import apiClient from "../utils/server";


export async function signUpUser(data){
    const {username,email,gender,password,fullName} = data;
    console.log(import.meta.env.VITE_SERVER_URL)
    try {
        const response = await apiClient.post("/auth/signup",{
            username,
            email,
            gender,
            password,
            full_name: fullName
        });
        console.log(response)
        return response.data
    } catch (error) {
        console.error("Error signing up user:", error);
        throw error;
    }    
}

export async function loginUser(data){
    const {email,password} = data;
    try {
        const response = await apiClient.post("/auth/login",{
            email,
            password
        });
        const token = response.data.access_token;
        localStorage.setItem('token', token);        
        return response.data.user
    } catch (error) {
        console.error("Error signing up user:", error);
        throw error;
    }    
}

export async function getUser(username){

    try {
        const response = await apiClient.get(`/users/${username}`);
        return response.data
    } catch (error) {
        console.error("Error signing up user:", error);
        throw error;
    }

}
