import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchDestination(id: string) {
  const response = await api.get(`/destinations/${id}`);
  return response.data;
}

export async function fetchHotels(params: any) {
  const response = await api.get('/hotels', { params });
  return response.data;
}

export async function fetchFlights(params: any) {
  const response = await api.get('/flights', { params });
  return response.data;
}

export async function fetchUserProfile() {
  const response = await api.get('/profile');
  return response.data;
}

export async function updateUserProfile(data: any) {
  const response = await api.put('/profile', data);
  return response.data;
}