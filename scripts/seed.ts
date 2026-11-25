import { createClient } from "@supabase/supabase-js";
import type { Model, SubmissionMedia } from "../types/app";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const reset = process.argv.includes("--reset");

if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Add them to .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MODEL_IDS = Array.from(
  { length: 24 },
  (_, index) => `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);
const CAST_IDS = Array.from(
  { length: 4 },
  (_, index) => `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);
const MEMBER_IDS = Array.from(
  { length: 40 },
  (_, index) => `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);
const INVITATION_IDS = Array.from(
  { length: 12 },
  (_, index) => `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);

const future = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const dateOnly = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

type SeedModel = Partial<Model> & {
  id: string;
  name: string;
  phone: string;
  headshot_url: string;
  status: "pending" | "approved";
};

const modelRows = [
  { id: MODEL_IDS[0], name: "Asta Lindberg", phone: "+4520120001", city: "Copenhagen", height_cm: 178, bust_cm: 82, waist_cm: 61, hips_cm: 89, shoe_size: 39.5, hair_color: "Blonde", eye_color: "Blue", status: "approved", headshot_url: "/seed/model-01.jpg", bio: "A quiet, architectural presence with a background in contemporary dance. Based between Copenhagen and Berlin." },
  { id: MODEL_IDS[1], name: "Malika Osei", phone: "+4520120002", city: "Copenhagen", height_cm: 186, bust_cm: 96, waist_cm: 78, hips_cm: 96, shoe_size: 44, hair_color: "Black", eye_color: "Brown", status: "approved", headshot_url: "/seed/model-02.jpg", bio: "Editorial and runway. Interested in character-led work, music, and long-form campaigns." },
  { id: MODEL_IDS[2], name: "Ingrid Voss", phone: "+4520120003", city: "Aarhus", height_cm: 174, bust_cm: 80, waist_cm: 60, hips_cm: 88, shoe_size: 39, hair_color: "Light brown", eye_color: "Green", status: "approved", headshot_url: "/seed/model-03.jpg", bio: "Minimal, direct, and drawn to natural light. Available for editorial and commercial work across Scandinavia." },
  { id: MODEL_IDS[3], name: "Noor Haddad", phone: "+4520120004", city: "Copenhagen", height_cm: 171, bust_cm: 84, waist_cm: 63, hips_cm: 91, shoe_size: 38, hair_color: "Dark brown", eye_color: "Brown", status: "approved", headshot_url: "/seed/model-04.jpg", bio: "A calm confidence with a strong editorial instinct. Fluent in Danish, Arabic, and English." },
  { id: MODEL_IDS[4], name: "Elias Mørk", phone: "+4520120005", city: "Copenhagen", height_cm: 183, bust_cm: 95, waist_cm: 77, hips_cm: 95, shoe_size: 43, hair_color: "Brown", eye_color: "Grey", status: "approved", headshot_url: "/seed/model-05.jpg", bio: "Interested in the space between documentary and fashion. Comfortable on set and on location." },
  { id: MODEL_IDS[5], name: "Freja Bang", phone: "+4520120006", city: "Odense", height_cm: 176, bust_cm: 81, waist_cm: 61, hips_cm: 90, shoe_size: 40, hair_color: "Red", eye_color: "Green", status: "approved", headshot_url: "/seed/model-06.jpg", bio: "Known for a warm, irreverent energy. Background in theatre and movement direction." },
  { id: MODEL_IDS[6], name: "Luca Moretti", phone: "+4520120007", city: "Copenhagen", height_cm: 185, bust_cm: 97, waist_cm: 79, hips_cm: 97, shoe_size: 44, hair_color: "Black", eye_color: "Hazel", status: "approved", headshot_url: "/seed/model-07.jpg", bio: "Milan-born, Copenhagen-based. A considered presence for tailoring and quiet luxury." },
  { id: MODEL_IDS[7], name: "Selma Ek", phone: "+4520120008", city: "Malmö", height_cm: 170, bust_cm: 80, waist_cm: 60, hips_cm: 87, shoe_size: 38, hair_color: "Blonde", eye_color: "Blue", status: "approved", headshot_url: "/seed/model-08.jpg", bio: "Natural warmth and a strong face for beauty. Works comfortably across stills and motion." },
  { id: MODEL_IDS[8], name: "Thea Andersen", phone: "+4520120009", city: "Aarhus", height_cm: 189, bust_cm: 98, waist_cm: 79, hips_cm: 96, shoe_size: 45, hair_color: "Blonde", eye_color: "Blue", status: "approved", headshot_url: "/seed/model-09.jpg", bio: "A precise, understated presence. Experienced in sportswear, outerwear, and editorial." },
  { id: MODEL_IDS[9], name: "Amara Diallo", phone: "+4520120010", city: "Copenhagen", height_cm: 175, bust_cm: 86, waist_cm: 64, hips_cm: 94, shoe_size: 40, hair_color: "Black", eye_color: "Brown", status: "approved", headshot_url: "/seed/model-10.jpg", bio: "Editorial, beauty, and campaign work. Interested in projects with a strong point of view." },
  { id: MODEL_IDS[10], name: "Vigga Holm", phone: "+4520120011", city: "Copenhagen", height_cm: 181, bust_cm: 94, waist_cm: 76, hips_cm: 93, shoe_size: 43, hair_color: "Brown", eye_color: "Brown", status: "approved", headshot_url: "/seed/model-11.jpg", bio: "An easy, lived-in quality. Comfortable with long days on location and director-led work." },
  { id: MODEL_IDS[11], name: "Elin Sørensen", phone: "+4520120012", city: "Aalborg", height_cm: 172, bust_cm: 82, waist_cm: 62, hips_cm: 90, shoe_size: 39, hair_color: "Dark blonde", eye_color: "Grey", status: "approved", headshot_url: "/seed/model-12.jpg", bio: "Quietly expressive, with a background in fine art. Available for editorial and fitting work." },
  { id: MODEL_IDS[12], name: "Jonas Bech", phone: "+4520120013", city: "Odense", height_cm: 187, bust_cm: 99, waist_cm: 80, hips_cm: 97, shoe_size: 44, hair_color: "Black", eye_color: "Brown", status: "approved", headshot_url: "/seed/model-13.jpg", bio: "Strong, calm, and adaptable. Interested in tailoring, architecture, and documentary-style campaigns." },
  { id: MODEL_IDS[13], name: "Yusuf Nasser", phone: "+4520120014", city: "Aarhus", height_cm: 169, bust_cm: 83, waist_cm: 62, hips_cm: 89, shoe_size: 38, hair_color: "Dark brown", eye_color: "Green", status: "approved", headshot_url: "/seed/model-14.jpg", bio: "A striking presence for beauty and accessories. Fluent in Danish, English, and French." },
  { id: MODEL_IDS[14], name: "Mikkel Frost", phone: "+4520120015", city: "Copenhagen", height_cm: 180, bust_cm: 92, waist_cm: 75, hips_cm: 92, shoe_size: 43, hair_color: "Grey", eye_color: "Blue", status: "approved", headshot_url: "/seed/model-15.jpg", bio: "A distinctive silver-haired face. Interested in character work and independent film." },
  { id: MODEL_IDS[15], name: "Sofia Lind", phone: "+4520120016", city: "Malmö", height_cm: 177, bust_cm: 85, waist_cm: 64, hips_cm: 92, shoe_size: 41, hair_color: "Brown", eye_color: "Brown", status: "approved", is_hidden: true, headshot_url: "/seed/model-16.jpg", bio: "Available for select projects. Currently kept off the public roster at the model's request." },
  { id: MODEL_IDS[16], name: "Emilie Ravn", phone: "+4520120017", city: "Aalborg", height_cm: 184, bust_cm: 94, waist_cm: 77, hips_cm: 94, shoe_size: 44, hair_color: "Brown", eye_color: "Green", status: "approved", headshot_url: "/seed/model-17.jpg", bio: "A natural collaborator with a love of process. Comfortable in commercial and editorial worlds." },
  { id: MODEL_IDS[17], name: "Nadia Holm", phone: "+4520120018", city: "Copenhagen", height_cm: 168, bust_cm: 82, waist_cm: 61, hips_cm: 88, shoe_size: 38, hair_color: "Black", eye_color: "Hazel", status: "approved", headshot_url: "/seed/model-18.jpg", bio: "Beauty-focused with a strong graphic quality. Available for campaign and motion work." },
  { id: MODEL_IDS[18], name: "Oda Lund", phone: "+4520120019", city: "Aarhus", height_cm: 191, bust_cm: 100, waist_cm: 82, hips_cm: 98, shoe_size: 46, hair_color: "Blonde", eye_color: "Blue", status: "pending", headshot_url: "/seed/model-19.jpg", bio: "New to the agency. A strong, open presence with an interest in sportswear and editorial." },
  { id: MODEL_IDS[19], name: "Villads Skov", phone: "+4520120020", city: "Copenhagen", height_cm: 173, bust_cm: 84, waist_cm: 63, hips_cm: 91, shoe_size: 39, hair_color: "Blonde", eye_color: "Grey", status: "pending", is_hidden: true, headshot_url: "/seed/model-20.jpg", bio: "A calm, modern face. Applied directly through the website and requested a private profile." },
  { id: MODEL_IDS[20], name: "Alma Eriksen", phone: "+4520120021", city: "Odense", height_cm: 182, bust_cm: 93, waist_cm: 76, hips_cm: 93, shoe_size: 43, hair_color: "Brown", eye_color: "Brown", status: "pending", headshot_url: "/seed/model-21.jpg", bio: "A dependable commercial presence with a background in competitive swimming." },
  { id: MODEL_IDS[21], name: "Liva Damgaard", phone: "+4520120022", city: "Copenhagen", height_cm: 175, bust_cm: 85, waist_cm: 64, hips_cm: 92, shoe_size: 40, hair_color: "Dark blonde", eye_color: "Blue", status: "pending", headshot_url: "/seed/model-22.jpg", bio: "A recent discovery with a natural, unforced quality. Interested in beauty and still life." },
  { id: MODEL_IDS[22], name: "Agnes Kjeldsen", phone: "+4520120023", city: "Aalborg", height_cm: 188, bust_cm: 97, waist_cm: 79, hips_cm: 96, shoe_size: 45, hair_color: "Black", eye_color: "Blue", status: "pending", headshot_url: "/seed/model-23.jpg", bio: "Applied through a Norrøna cast invitation. A quiet, outdoors-oriented presence." },
  { id: MODEL_IDS[23], name: "Iben Storm", phone: "+4520120024", city: "Aarhus", height_cm: 171, bust_cm: 81, waist_cm: 60, hips_cm: 89, shoe_size: 38, hair_color: "Red", eye_color: "Green", status: "approved", headshot_url: "/seed/model-24.jpg", bio: "A sharp, modern face with an affinity for colour and texture. Available for editorial." },
].map((model, index) => ({
  created_at: new Date(Date.now() - index * 60_000).toISOString(),
  email: `${model.name.toLowerCase().replace(/[^a-z]+/g, ".")}@demo.grotherp.com`,
  is_hidden: false,
  ...model,
})) as SeedModel[];

const castRows = [
  {
    id: CAST_IDS[0],
    title: "Aesop — Objects in Stillness",
    client_name: "Aesop",
    description:
      "A study in texture, patience, and quiet movement. Editorial stills and short motion pieces for the winter collection.",
    location: "Copenhagen",
    shoot_start: dateOnly(12),
    shoot_end: dateOnly(13),
    status: "open",
  },
  {
    id: CAST_IDS[1],
    title: "COS — The Quiet Edit",
    client_name: "COS",
    description:
      "A restrained editorial cast for a capsule campaign shot across two days in Copenhagen.",
    location: "Copenhagen",
    shoot_start: dateOnly(21),
    shoot_end: dateOnly(22),
    status: "open",
  },
  {
    id: CAST_IDS[2],
    title: "Norrøna — Field Notes",
    client_name: "Norrøna",
    description:
      "Outdoor campaign with a documentary approach. Movement, weather, and long days on location.",
    location: "Jutland",
    shoot_start: dateOnly(35),
    shoot_end: dateOnly(37),
    status: "open",
  },
  {
    id: CAST_IDS[3],
    title: "Kinfolk — Portraits of Home",
    client_name: "Kinfolk",
    description:
      "An intimate portrait series about domestic space and the people who shape it.",
    location: "Aarhus",
    shoot_start: dateOnly(48),
    shoot_end: dateOnly(48),
    status: "closed",
  },
];

const media = {
  flower: {
    id: "51000000-0000-4000-8000-000000000001",
    kind: "video" as const,
    url: "/seed/casting-flower.mp4",
    name: "Casting clip — flower study.mp4",
    mime: "video/mp4",
    size: 1_100_000,
  },
  bunny: {
    id: "51000000-0000-4000-8000-000000000002",
    kind: "video" as const,
    url: "/seed/casting-bunny.mp4",
    name: "Casting clip — movement test.mp4",
    mime: "video/mp4",
    size: 947_000,
  },
  stillOne: {
    id: "51000000-0000-4000-8000-000000000003",
    kind: "image" as const,
    url: "/seed/casting-still-01.jpg",
    name: "Casting still 01.jpg",
    mime: "image/jpeg",
    size: 134_000,
  },
  stillTwo: {
    id: "51000000-0000-4000-8000-000000000004",
    kind: "image" as const,
    url: "/seed/casting-still-02.jpg",
    name: "Casting still 02.jpg",
    mime: "image/jpeg",
    size: 135_000,
  },
} satisfies Record<string, SubmissionMedia>;

type SeedMember = {
  castIndex: number;
  modelIndex: number;
  role_notes: string;
  media: SubmissionMedia[];
};

const memberSpecs: SeedMember[] = [
  { castIndex: 0, modelIndex: 0, role_notes: "Lead — the watcher. Available both days.", media: [media.flower, media.stillOne] },
  { castIndex: 0, modelIndex: 1, role_notes: "Lead — morning scenes only on day one.", media: [media.bunny] },
  { castIndex: 0, modelIndex: 3, role_notes: "Supporting — hands and close detail work.", media: [media.stillTwo] },
  { castIndex: 0, modelIndex: 6, role_notes: "Supporting — final scene, day two.", media: [] },
  { castIndex: 0, modelIndex: 9, role_notes: "Beauty insert — day one afternoon.", media: [media.stillOne] },
  { castIndex: 0, modelIndex: 14, role_notes: "Character portrait — day two.", media: [media.flower] },
  { castIndex: 1, modelIndex: 2, role_notes: "Lead — quiet edit, day one.", media: [media.stillTwo] },
  { castIndex: 1, modelIndex: 5, role_notes: "Movement sequence — both days.", media: [media.bunny, media.stillOne] },
  { castIndex: 1, modelIndex: 7, role_notes: "Beauty close-ups.", media: [media.stillOne] },
  { castIndex: 1, modelIndex: 11, role_notes: "Supporting cast — day two.", media: [] },
  { castIndex: 1, modelIndex: 13, role_notes: "Accessories and detail shots.", media: [media.stillTwo] },
  { castIndex: 1, modelIndex: 15, role_notes: "Private casting. Do not publish.", media: [media.flower] },
  { castIndex: 1, modelIndex: 17, role_notes: "Additional face — day two.", media: [] },
  { castIndex: 2, modelIndex: 4, role_notes: "Lead — location scout approved.", media: [media.bunny] },
  { castIndex: 2, modelIndex: 8, role_notes: "Movement lead — weather dependent.", media: [media.flower, media.stillTwo] },
  { castIndex: 2, modelIndex: 10, role_notes: "Supporting — day one only.", media: [] },
  { castIndex: 2, modelIndex: 16, role_notes: "Supporting — location TBC.", media: [media.stillOne] },
  { castIndex: 2, modelIndex: 22, role_notes: "Invited applicant — awaiting agency approval.", media: [media.flower] },
  { castIndex: 3, modelIndex: 12, role_notes: "Lead portrait — one day.", media: [media.stillTwo] },
  { castIndex: 3, modelIndex: 15, role_notes: "Interior portrait — afternoon.", media: [media.stillOne] },
];

const memberRows = memberSpecs.map((member, index) => ({
  id: MEMBER_IDS[index],
  cast_id: CAST_IDS[member.castIndex],
  model_id: MODEL_IDS[member.modelIndex],
  role_notes: member.role_notes,
  submission_media: member.media,
}));

const draftProfile = {
  name: "Sofie Aagaard",
  email: "sofie.aagaard@example.com",
  city: "Copenhagen",
  height_cm: 174,
  bust_cm: 82,
  waist_cm: 62,
  hips_cm: 90,
  shoe_size: 39,
  hair_color: "Dark blonde",
  eye_color: "Green",
  bio: "Half-finished application saved from a previous visit.",
};

const invitationRows = [
  {
    id: INVITATION_IDS[0],
    token: "demo-cast-active",
    cast_id: CAST_IDS[0],
    target_model_id: null,
    claimed_model_id: null,
    require_media_upload: true,
    expires_at: future(3),
    draft_data: {},
    status: "active",
  },
  {
    id: INVITATION_IDS[1],
    token: "demo-cast-no-media",
    cast_id: CAST_IDS[1],
    target_model_id: null,
    claimed_model_id: null,
    require_media_upload: false,
    expires_at: future(7),
    draft_data: {},
    status: "active",
  },
  {
    id: INVITATION_IDS[2],
    token: "demo-media-request",
    cast_id: CAST_IDS[0],
    target_model_id: MODEL_IDS[3],
    claimed_model_id: null,
    require_media_upload: true,
    expires_at: future(2),
    draft_data: {},
    status: "active",
  },
  {
    id: INVITATION_IDS[3],
    token: "demo-draft",
    cast_id: CAST_IDS[1],
    target_model_id: null,
    claimed_model_id: null,
    require_media_upload: true,
    expires_at: future(4),
    draft_data: {
      schemaVersion: 1,
      step: "register",
      phone: "+4520999999",
      profile: draftProfile,
      isHidden: true,
      media: [],
      lookup: { matched: false },
      clientUpdatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    status: "in_progress",
  },
  {
    id: INVITATION_IDS[4],
    token: "demo-submitted",
    cast_id: CAST_IDS[2],
    target_model_id: null,
    claimed_model_id: MODEL_IDS[22],
    require_media_upload: true,
    expires_at: future(2),
    draft_data: {
      schemaVersion: 1,
      step: "register",
      phone: "+4520120023",
      profile: {
        name: "Agnes Kjeldsen",
        email: "agnes.kjeldsen@demo.grotherp.com",
        city: "Aalborg",
      },
      isHidden: false,
      media: [media.flower],
      lookup: { matched: false },
    },
    status: "submitted",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: INVITATION_IDS[5],
    token: "demo-completed",
    cast_id: CAST_IDS[3],
    target_model_id: null,
    claimed_model_id: MODEL_IDS[7],
    require_media_upload: false,
    expires_at: future(10),
    draft_data: {
      schemaVersion: 1,
      step: "phone",
      phone: "+4520120008",
      lookup: { matched: true, name: "Selma Ek", alreadyOnCast: true },
    },
    status: "completed",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: INVITATION_IDS[6],
    token: "demo-expired",
    cast_id: CAST_IDS[0],
    target_model_id: null,
    claimed_model_id: null,
    require_media_upload: true,
    expires_at: future(-1),
    draft_data: {},
    status: "expired",
  },
  {
    id: INVITATION_IDS[7],
    token: "demo-pending-invite",
    cast_id: CAST_IDS[1],
    target_model_id: null,
    claimed_model_id: MODEL_IDS[21],
    require_media_upload: true,
    expires_at: future(5),
    draft_data: {
      schemaVersion: 1,
      step: "register",
      phone: "+4520120022",
      profile: {
        name: "Liva Damgaard",
        email: "liva.damgaard@demo.grotherp.com",
        city: "Copenhagen",
      },
      media: [media.stillTwo],
      lookup: { matched: false },
    },
    status: "submitted",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
];

async function deleteDemoData() {
  await supabase.from("invitations").delete().in("id", INVITATION_IDS);
  await supabase.from("cast_members").delete().in("id", MEMBER_IDS);
  await supabase.from("casts").delete().in("id", CAST_IDS);
  await supabase.from("models").delete().in("id", MODEL_IDS);
}

async function resetAll() {
  await supabase.from("invitations").delete().gte("created_at", "1970-01-01");
  await supabase.from("cast_members").delete().gte("created_at", "1970-01-01");
  await supabase.from("casts").delete().gte("created_at", "1970-01-01");
  await supabase.from("models").delete().gte("created_at", "1970-01-01");
}

async function main() {
  console.log(reset ? "Resetting all demo tables…" : "Refreshing demo records…");

  if (reset) await resetAll();
  else await deleteDemoData();

  const { error: modelsError } = await supabase.from("models").insert(modelRows);
  if (modelsError) throw modelsError;

  const castInsertRows = castRows.map((cast, index) => ({
    ...cast,
    created_at: new Date(Date.now() - index * 60_000).toISOString(),
  }));
  const { error: castsError } = await supabase.from("casts").insert(castInsertRows);
  if (castsError) throw castsError;

  const { error: membersError } = await supabase
    .from("cast_members")
    .insert(memberRows);
  if (membersError) throw membersError;

  const invitationInsertRows = invitationRows.map((invitation, index) => ({
    ...invitation,
    created_at: new Date(Date.now() - index * 60_000).toISOString(),
  }));
  const { error: invitationsError } = await supabase
    .from("invitations")
    .insert(invitationInsertRows);
  if (invitationsError) throw invitationsError;

  const { count: modelCount } = await supabase
    .from("models")
    .select("*", { count: "exact", head: true });
  const { count: castCount } = await supabase
    .from("casts")
    .select("*", { count: "exact", head: true });
  const { count: invitationCount } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true });

  console.log(
    `Seeded ${modelCount} models, ${castCount} casts, ${invitationCount} invitations.`,
  );
  console.log("");
  console.log("Demo links:");
  console.log("  /invite/demo-cast-active");
  console.log("  /invite/demo-cast-no-media");
  console.log("  /invite/demo-media-request");
  console.log("  /invite/demo-draft");
  console.log("  /invite/demo-expired");
  console.log("");
  console.log("Admin passcode: see ADMIN_PASSCODE in .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
