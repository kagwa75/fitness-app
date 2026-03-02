const API_BASE = 'http://192.168.100.6:3000/api'; // 👈 your local IP

export const api = {
  getFiltered: async ({ bodyPart, equipment, muscle, difficulty, limit = 20, offset = 0 } = {}) => {
    const params = new URLSearchParams();
    if (bodyPart) params.set('bodyPart', String(bodyPart).toLowerCase());
    if (equipment) params.set('equipment', String(equipment).toLowerCase());
    if (muscle) params.set('muscle', String(muscle).toLowerCase());
    if (difficulty) params.set('difficulty', String(difficulty).toLowerCase());
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    const res = await fetch(`${API_BASE}/exercises/filter?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    return data.data || [];
  },

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
