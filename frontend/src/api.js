import axios from 'axios';

const api = axios.create({
   
    baseURL: 'http://nebula.leader-sys.com:8080/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export default api;