import axios from "axios";

export const getToken = () => localStorage.getItem("token");

export const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});