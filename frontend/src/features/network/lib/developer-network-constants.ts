import { DEVELOPER_NETWORK_PROFILES } from "@/features/developer-dashboard/data/developer-network-data";

export const STORAGE_KEY = "evolv_developer_network_state";
export const NETWORK_PEOPLE = DEVELOPER_NETWORK_PROFILES;

export const initialConnected = NETWORK_PEOPLE.reduce<Record<string, boolean>>((acc, person) => {
  acc[person.id] = person.connected;
  return acc;
}, {});
