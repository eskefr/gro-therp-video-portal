export type ModelProfileSource =
  | "archive"
  | "applications"
  | "cast"
  | "invitations";

export function modelProfilePath(
  phone: string,
  options?: {
    from?: ModelProfileSource;
    castId?: string;
    invitationId?: string;
  },
) {
  const params = new URLSearchParams();
  if (options?.from) params.set("from", options.from);
  if (options?.castId) params.set("cast", options.castId);
  if (options?.invitationId) params.set("invitation", options.invitationId);

  const query = params.toString();
  const hash = options?.invitationId
    ? `#invitation-${options.invitationId}`
    : "";
  const key = phone.replace(/\D/g, "") || phone;

  return `/admin/models/${encodeURIComponent(key)}${
    query ? `?${query}` : ""
  }${hash}`;
}
