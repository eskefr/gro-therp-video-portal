export type ModelStatus = "pending" | "approved";
export type CastStatus = "open" | "closed";
export type InvitationStatus =
  | "active"
  | "in_progress"
  | "submitted"
  | "completed"
  | "expired";
export type EffectiveInvitationStatus = InvitationStatus;
export type MediaKind = "image" | "video";

export interface Model {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  height_cm: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  shoe_size: number | null;
  hair_color: string | null;
  eye_color: string | null;
  bio: string | null;
  age: number | null;
  initials: string;
  headshot_url: string;
  is_hidden: boolean;
  status: ModelStatus;
  created_at: string;
  updated_at: string;
}

export type PublicModel = Pick<
  Model,
  "id" | "initials" | "age" | "headshot_url" | "created_at"
>;

export interface Cast {
  id: string;
  title: string;
  client_name: string | null;
  description: string | null;
  location: string | null;
  shoot_start: string | null;
  shoot_end: string | null;
  status: CastStatus;
  created_at: string;
  updated_at: string;
}

export interface SubmissionMedia {
  id: string;
  kind: MediaKind;
  path?: string;
  url?: string;
  name: string;
  mime: string;
  size: number;
}

export interface SignedMedia extends SubmissionMedia {
  signedUrl?: string;
}

export interface CastMember {
  id: string;
  cast_id: string;
  model_id: string;
  role_notes: string | null;
  submission_media: SubmissionMedia[];
  created_at: string;
  updated_at: string;
}

export interface CastMemberWithModel extends CastMember {
  model: Model;
}

export interface Invitation {
  id: string;
  token: string;
  cast_id: string;
  target_model_id: string | null;
  claimed_model_id: string | null;
  require_media_upload: boolean;
  expires_at: string;
  draft_data: DraftData;
  status: InvitationStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvitationWithRelations extends Invitation {
  cast: Cast;
  target_model: Model | null;
  claimed_model: Model | null;
}

export interface DraftProfile {
  name?: string;
  email?: string;
  city?: string;
  height_cm?: number | null;
  bust_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  shoe_size?: number | null;
  hair_color?: string;
  eye_color?: string;
  bio?: string;
  age?: number | null;
}

export interface DraftHeadshot {
  path?: string;
  url: string;
  name?: string;
}

export interface DraftLookup {
  matched: boolean;
  name?: string;
  alreadyOnCast?: boolean;
}

export interface DraftData {
  schemaVersion?: number;
  step?: "phone" | "existing" | "register" | "media";
  phone?: string;
  profile?: DraftProfile;
  isHidden?: boolean;
  headshot?: DraftHeadshot | null;
  media?: SubmissionMedia[];
  lookup?: DraftLookup;
  clientUpdatedAt?: string;
  savedAt?: string;
}

export interface PublicModelFilters {
  q?: string;
  ageMin?: number;
  ageMax?: number;
  page?: number;
}

export interface CastWithCount extends Cast {
  memberCount: number;
  mediaCount: number;
}

export interface PendingApplication extends Model {
  source?: {
    castTitle: string;
    token: string;
  } | null;
}

export interface AdminStats {
  approved: number;
  hidden: number;
  pending: number;
  openCasts: number;
  activeInvitations: number;
}

export interface CastDetail {
  cast: Cast;
  members: CastMemberWithModel[];
  invitations: Invitation[];
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
