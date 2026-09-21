import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../service/config";

const API_URL = API_BASE_URL;

export const useFetchSensor = async (
  sensor,
  sensorId,
  mannequinId = 1,
  returnFullResponse = false,
  limit = 10,
) => {
  try {
    const token = Cookies.get("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `${API_URL}/sensor/${sensor}/${sensorId}?mid=${mannequinId}&limit=${limit}`,
      { headers },
    );

    return returnFullResponse ? response.data : response.data.data;
  } catch (error) {
    console.error(`Error fetching data`, error);
    return null;
  }
};
