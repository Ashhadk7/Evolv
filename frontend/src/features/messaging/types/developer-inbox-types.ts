export type {
  PersonType,
  InboxFilter,
  RequestStatus,
  RequestDirection,
  Message,
  Contact,
  StoredProfile,
  StoredAppUser,
} from "./shared-inbox-types";
import type { CurrentInboxUser, InboxLaunchContact } from "./shared-inbox-types";

export type CurrentDeveloper = CurrentInboxUser;
export type DeveloperInboxLaunchContact = InboxLaunchContact;
