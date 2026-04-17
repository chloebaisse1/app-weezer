import axios from 'axios';


const api = axios.create({
    // Utilise l'URL du .env ou l'URL par défaut de ton serveur local
    baseURL: import.meta.env.VITE_API_URL || 'http://nebula.leader-sys.com:8080/api',
    timeout: 30000, 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' 
    }
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
       
        const message = error.response?.data?.message || error.message;
        console.error('[Nebula API Error]:', message);

        
        return Promise.reject(error);
    }
);

export default api;