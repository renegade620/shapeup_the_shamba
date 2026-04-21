import client from "./client";

export const getUpdates    = (fieldId) => client.get(`/fields/${fieldId}/updates`).then((r) => r.data);
export const createUpdate  = (fieldId, data) => client.post(`/fields/${fieldId}/updates`, data).then((r) => r.data);
export const getRecentUpdates = (limit = 20) => client.get(`/updates/recent?limit=${limit}`).then((r) => r.data);
