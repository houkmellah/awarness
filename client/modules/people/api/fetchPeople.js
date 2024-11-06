import axios from "axios";
import { apiUrl } from "../../utils/config";

export const fetchPeople = async (token) => {
  try {
    const { data } = await axios.get(`${apiUrl}/people`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des personnes:", error);
    throw error;
  }
};
