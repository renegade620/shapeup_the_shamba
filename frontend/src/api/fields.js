import client from "./client";

export const getFields    = ()           => client.get("/fields").then((r) => r.data);
export const getField     = (id)         => client.get(`/fields/${id}`).then((r) => r.data);
export const getFieldSummary = ()        => client.get("/fields/summary").then((r) => r.data);
export const createField  = (data)       => client.post("/fields", data).then((r) => r.data);
export const updateField  = (id, data)   => client.patch(`/fields/${id}`, data).then((r) => r.data);
export const deleteField  = (id)         => client.delete(`/fields/${id}`);
export const getAgents    = ()           => client.get("/users/agents").then((r) => r.data);
