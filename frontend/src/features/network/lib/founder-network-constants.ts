import { FOUNDER_NETWORK_PROFILES } from "@/features/network/data";

export const STORAGE_KEY = "evolv_founder_network_state";
export const NETWORK_PEOPLE = FOUNDER_NETWORK_PROFILES;

export const initialConnected = NETWORK_PEOPLE.reduce<Record<string, boolean>>((acc, person) => {
  acc[person.id] = person.connected;
  return acc;
}, {});
