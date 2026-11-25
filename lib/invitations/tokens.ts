import { customAlphabet } from "nanoid";

const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";

export function generateInvitationToken() {
  return customAlphabet(alphabet, 24)();
}

export function isReasonableToken(token: string) {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(token);
}
