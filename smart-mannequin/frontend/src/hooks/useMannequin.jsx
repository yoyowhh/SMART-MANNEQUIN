import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../service/config";

const API_URL = API_BASE_URL;

export const UseFetchMannequin = async () => {
  try {
    const token = Cookies.get("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/mannequin`, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching data`, error);
    return null;
  }
};

export const UseFetchMannequinById = async (mannequinId) => {
  try {
    const token = Cookies.get("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/mannequin/${mannequinId}`, {
      headers,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching data`, error);
    return null;
  }
};
