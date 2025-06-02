import flattenData from "../utils/flatten";
import apiClient from "../utils/server";

export async function getWorkspaces(userId=1){
    try {
        const response = await apiClient.get(`/directories/tree/${userId}`);
        const {owned_structure: ownData, shared_documents: sharedData} = response.data;
        // console.log("before", ownData)
        const data = flattenData(ownData)
        // console.log("after", data)
        return {data,sharedData}
    } catch (error) {
        console.error("Error geting workspaces:", error);
        throw error;   
    }
}


export async function createDirectory(data){
    const {name:dir_name, parentId:parent_id,color, userId:user_id} = data;

    try {
        const response = await apiClient.post("/directories/",{dir_name,parent_id,color, user_id});
        return response.data
    } catch (error) {
        console.error("Error creating directory:", error.response.data.detail);
        throw error;   
    }
}


export async function createDocument(data){
    const {name:doc_name, parentId:directory_id, userId:user_id} = data;
    try {
        const response = await apiClient.post("/documents/",{doc_name,directory_id, user_id,content:""});
        return response.data
    } catch (error) {
        console.error("Error creating directory:", error.response.data.detail);
        throw error;   
    }
}

export async function getDocument(id){
    try {
        const response = await apiClient.get(`/documents/${id}`);
        return response.data
    } catch (error) {
        console.error("Error geting document:", error.response.data.detail);
        throw error;   
    }
}

export async function saveDocument(id,data){
    try {
        const response = await apiClient.put(`/documents/${id}`,data);
        return response.data
    } catch (error) {
        console.error("Error geting document:", error.response.data.detail);
        throw error;   
    }
}