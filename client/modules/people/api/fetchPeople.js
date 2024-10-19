import axios from "axios";
import { apiUrl } from "../../utils/config";

export const fetchPeople = async (token) => {
  const { data } = await axios.get(`${apiUrl}/people`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
