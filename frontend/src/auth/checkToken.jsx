import axios from "axios";

const checkToken = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return false;

    const response = await axios.get("http://localhost:8080/user/checkToken", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message === "true";
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

export default checkToken;
