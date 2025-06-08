import flattenData from "../utils/flatten";
import apiClient from "../utils/server";

export async function getWorkspaces(userId = 1) {
  try {
    const response = await apiClient.get(`/directories/tree/${userId}`);
    const { owned_structure: ownData, shared_documents: sharedData } =
      response.data;
    const data = flattenData(ownData);
    console.log(data);
    return { data, sharedData };
  } catch (error) {
    console.error("Error geting workspaces:", error);
    throw error;
  }
}

export async function createDirectory(data) {
  const { name: dir_name, parentId: parent_id, color, userId: user_id } = data;

  try {
    const response = await apiClient.post("/directories/", {
      dir_name,
      parent_id,
      color,
      user_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating directory:", error.response.data.detail);
    throw error;
  }
}

export async function createDocument(data) {
  const { name: doc_name, parentId: directory_id, userId: user_id } = data;
  try {
    const response = await apiClient.post("/documents/", {
      doc_name,
      directory_id,
      user_id,
      content: "",
    });
    return response.data;
  } catch (error) {
    console.error("Error creating directory:", error.response.data.detail);
    throw error;
  }
}

export async function getDocumentData(id) {
  try {
    const response = await apiClient.get(`/documents/${id}`);
    const response2 = await apiClient.get(`/access_document/document/${id}`);
    const mockDocument = response.data;
    const sharedAccess = response2.data;
    return { mockDocument, sharedAccess };
  } catch (error) {
    console.error("Error geting document:", error.response.data.detail);
    throw error;
  }
}

export async function saveDocument(id, data) {
  try {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error geting document:", error.response.data.detail);
    throw error;
  }
}

export async function updateItem(data) {
  const { type } = data;
  if (type === "folder") {
    const { id, name, color, parent_id } = data;
    try {
      const response = await apiClient.put(`/directories/${id}`, {
        dir_name: name,
        color: color,
        parent_id: parent_id,
      });
      return response.data;
    } catch (error) {
      console.error("Error geting document:", error.response.data);
      throw error;
    }
  } else {
    const { id, name, parent_id, content, isStared } = data;
    try {
      const response = await apiClient.put(`/documents/${id}`, {
        doc_name: name,
        directory_id: parent_id,
        content,
        is_stared: isStared,
      });
      return response.data;
    } catch (error) {
      console.error("Error geting document:", error.response.data);
      throw error;
    }
  }
}

export async function inviteUser(id, email, permission) {
  try {
    const response = await apiClient.post(`/access_document/`, {
      doc_id: id,
      email,
      permission,
    });
    return response.data;
  } catch (error) {
    console.error("Error geting document:", error.response.data);
    throw error;
  }
}

export async function deleteItem(item) {
  const { type } = item;
  if (type === "folder") {
    const { id } = item;
    try {
      const response = await apiClient.delete(`/directories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting directory:", error.response.data);
      throw error;
    }
  } else {
    const { id } = item;
    try {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleteing document:", error.response.data);
      throw error;
    }
  }
}
