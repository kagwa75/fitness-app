const API_BASE = 'http://192.168.100.6:3000/api'; // 👈 your local IP

export const api = {
  // Get exercises filtered by body part
  getByBodyPart: async (bodyPart, limit = 20) => {
    const res = await fetch(
       `${API_BASE}/exercises/filter?bodyPart=${encodeURIComponent(bodyPart.toLowerCase())}&limit=${limit}`
    );
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    return data.data; // our API wraps in { total, data: [...] }
  },

  // Search exercises
  search: async (query, limit = 20) => {
    const res = await fetch(
      `${API_BASE}/exercises/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.data;
  },

  // Get single exercise
  getById: async (id) => {
    const res = await fetch(`${API_BASE}/exercises/${id}`);
    if (!res.ok) throw new Error('Exercise not found');
    return res.json();
  },

  // Get all body parts
  getBodyParts: async () => {
    const res = await fetch(`${API_BASE}/exercises/body-parts`);
    if (!res.ok) throw new Error('Failed to fetch body parts');
    return res.json();
  },

  // Get all equipment
  getEquipment: async () => {
    const res = await fetch(`${API_BASE}/exercises/equipment`);
    if (!res.ok) throw new Error('Failed to fetch equipment');
    return res.json();
  },
};