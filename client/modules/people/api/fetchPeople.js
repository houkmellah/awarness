import axios from "axios";

export const fetchPeople = async (token) => {
  const { data } = await axios.get(`http://localhost:8000/api/people`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
