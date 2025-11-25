// services/api.js no seu Frontend (React)
import axios from 'axios';

const api = axios.create({
  // Use localhost e a porta 3001, que é onde a API Node.js irá rodar
  baseURL: 'http://localhost:3001/api', 
  timeout: 5000,
});

export default api;