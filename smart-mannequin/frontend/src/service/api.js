import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./config";

export const buildApiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const fetchData = async (apiUrl) => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(apiUrl, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching data from ${apiUrl}:`, error);
    return null;
  }
};

export const postData = async (apiUrl, data) => {
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.token) {
      Cookies.set("token", response.data.token, { expires: 1 / 24 });

      const expirationTime = new Date(
        new Date().getTime() + 1 * 60 * 60 * 1000,
      );

      Cookies.set("expirationTime", expirationTime, { expires: 1 / 24 });
    }

    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${apiUrl}:`, error);
    return null;
  }
};
