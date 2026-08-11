/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileImage,
  ImageOff,
  Loader2,
  Save,
  Store,
  Trash2,
  Truck,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import {
  deleteAdminMenuItem,
  deleteMenuItemImage,
  deleteVendorLogo,
  getAdminRiderDetails,
  getAdminVendorDetails,
  getAdminVendorMenuItems,
  updateAdminMenuItem,
  updateAdminVendorDetails,
  updateAdminRiderStatus,
  updateVendorStatus,
  uploadAdminMenuItemImage,
  uploadAdminVendorLogo,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Row = Record<string, any>;
type Kind = "vendor" | "rider";

const errorMessage = (error: any) =>
  error?.response?.data?.detail || error?.message || "Action failed";

const vendorSections: [string, [string, string][]][] = [
  ["Application", [["status", "Approval status"], ["created_at", "Submitted"], ["updated_at", "Last updated"], ["id", "Vendor ID"], ["user_id", "User ID"]]],
  ["Personal information", [["firstname", "First name"], ["lastname", "Last name"], ["email", "Personal email"], ["phone", "Personal phone"], ["how_to_address", "Preferred address"], ["full_name", "Full name"]]],
  ["Business information", [["business_name", "Business name"], ["pending_business_name", "Pending business name"], ["business_name_status", "Name approval"], ["business_email", "Business email"], ["business_phone", "Business phone"], ["business_category", "Business category"], ["business_description", "Description"], ["years_of_experience", "Years of experience"], ["profession", "Profession"], ["vendor_type", "Vendor type"], ["work_alone", "Works alone"], ["membership_id", "Membership ID"], ["registration_number", "Registration number"], ["tax_id", "Tax ID"], ["license_url", "Business licence"], ["delivery_radius_km", "Delivery radius km"], ["minimum_order", "Minimum order"], ["default_preparation_minutes", "Default prep minutes"], ["is_featured", "Featured vendor"], ["is_open", "Open for orders"], ["temporarily_closed", "Temporarily closed"], ["corporate_terms_accepted", "Corporate terms accepted"]]],
  ["Address and location", [["business_address", "Business address"], ["country_name", "Country"], ["state", "State"], ["city", "City"], ["lga", "LGA"], ["zip", "Postcode"], ["latitude", "Latitude"], ["longitude", "Longitude"]]],
  ["Availability", [["day_from", "Available from"], ["day_to", "Available to"], ["opening_time", "Opening time"], ["closing_time", "Closing time"], ["holidays_available", "Available on holidays"], ["total_workers", "Total workers"]]],
  ["Bank and payment", [["bank_name", "Bank"], ["account_number", "Account number"], ["account_name", "Account name"], ["accept_cod", "Accepts cash on delivery"]]],
  ["Media links", [["logo_url", "Logo URL"], ["cover_url", "Cover image URL"], ["store_front_picture_url", "Storefront picture URL"], ["face_video_url", "Face verification video URL"]]],
];

const vendorReadOnlyFields = new Set(["status", "created_at", "updated_at", "id", "user_id"]);
const vendorBooleanFields = new Set(["is_featured", "temporarily_closed", "is_open", "corporate_terms_accepted", "holidays_available", "accept_cod"]);
const vendorNumberFields = new Set(["delivery_radius_km", "minimum_order", "default_preparation_minutes", "latitude", "longitude", "total_workers"]);

const riderSections: [string, [string, string][]][] = [
  ["Application", [["status", "Approval status"], ["operational_status", "Fleet status"], ["is_active", "Account active"], ["profile_completed", "Profile complete"], ["created_at", "Submitted"], ["id", "Rider ID"], ["user_id", "User ID"]]],
  ["Personal information", [["firstname", "First name"], ["lastname", "Last name"], ["email", "Email"], ["phone", "Phone"], ["gender", "Gender"], ["address", "Address"], ["city", "City"], ["state", "State"], ["zip", "Postcode"], ["latitude", "Latitude"], ["longitude", "Longitude"]]],
  ["Vehicle and work", [["vehicle_type", "Vehicle type"], ["vehicle_brand", "Vehicle brand"], ["plate_number", "Plate number"], ["vehicle_registration", "Vehicle registration"], ["previous_work", "Previous work"], ["work_duration", "Work duration / availability"], ["delivery_range", "Delivery range (km)"], ["referral_code", "Referral code"]]],
  ["Next of kin", [["next_of_kin_name", "Name"], ["next_of_kin_phone", "Phone"]]],
  ["Performance", [["total_deliveries", "Total deliveries"], ["average_rating", "Average rating"], ["score", "Score"], ["response_time_rate", "Response rate"], ["balance", "Wallet balance"]]],
];

const mealDefaults = {
  id: "", name: "", description: "", price: "", price_description: "",
  category: "", category_slug: "", item_type: "meal", discount: "0",
  preparation_time: "", tags: "", payment_term: "online",
  delivery_option: "both", is_available: true, in_stock: true,
  inventory_quantity: "", variations: "[]",
  is_chef_special: false, has_spicy_level: false, has_addons: false,
  allow_schedule_send: true,
};

export default function ApprovalDetail({ kind, id, onBack, onChanged, backLabel = "Back to approvals" }: {
  kind: Kind;
  id: string;
  onBack: () => void;
  onChanged: () => Promise<void> | void;
  backLabel?: string;
}) {
  const { success, error: showError } = useToast();
  const [record, setRecord] = useState<Row | null>(null);
  const [meals, setMeals] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState({ ...mealDefaults });
  const [editingVendor, setEditingVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState<Row>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detailResponse = kind === "vendor"
        ? await getAdminVendorDetails(id)
        : await getAdminRiderDetails(id);
      setRecord(detailResponse.data || null);
      if (kind === "vendor") setVendorForm(detailResponse.data || {});
      if (kind === "vendor") {
        const menuResponse = await getAdminVendorMenuItems(id);
        setMeals(Array.isArray(menuResponse.data) ? menuResponse.data : []);
      }
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id, kind, showError]);

  useEffect(() => { load(); }, [load]);

  const run = async (key: string, action: () => Promise<unknown>, message: string) => {
    setBusy(key);
    try {
      await action();
      success(message);
      await load();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const decide = async (approved: boolean) => {
    setBusy("decision");
    try {
      if (kind === "vendor") await updateVendorStatus(id, approved ? "approved" : "suspended");
      else await updateAdminRiderStatus(id, approved ? "accepted" : "rejected");
      success(`${kind === "vendor" ? "Vendor" : "Rider"} ${approved ? "approved" : "rejected"}`);
      await onChanged();
      onBack();
    } catch (error) {
      showError(errorMessage(error));
      setBusy(null);
    }
  };

  const saveVendor = async () => {
    if (kind !== "vendor") return;
    const editableKeys = vendorSections.flatMap(([, fields]) => fields.map(([key]) => key)).filter((key) => !vendorReadOnlyFields.has(key));
    const payload = Object.fromEntries(editableKeys.filter((key) => String(vendorForm[key] ?? "") !== String(record?.[key] ?? "")).map((key) => [key, vendorForm[key] === "" ? null : vendorForm[key]]));
    if (!Object.keys(payload).length) { setEditingVendor(false); return; }
    setBusy("vendor-profile");
    try {
      await updateAdminVendorDetails(id, payload);
      success("Vendor details updated");
      setEditingVendor(false);
      await load();
      await onChanged();
    } catch (error) { showError(errorMessage(error)); }
    finally { setBusy(null); }
  };

  const editMeal = (meal: Row) => setMealForm({
    id: meal.id,
    name: meal.name || "",
    description: meal.description || "",
    price: String(meal.price ?? ""),
    price_description: meal.price_description || "",
    category: meal.category || "",
    category_slug: meal.category_slug || "",
    item_type: meal.item_type || "meal",
    discount: String(meal.discount ?? 0),
    preparation_time: meal.preparation_time || "",
    tags: meal.tags || "",
    payment_term: meal.payment_term || "online",
    delivery_option: meal.delivery_option || "both",
    inventory_quantity: meal.inventory_quantity == null ? "" : String(meal.inventory_quantity),
    variations: JSON.stringify(meal.variations || [], null, 2),
    is_available: Boolean(meal.is_available),
    in_stock: Boolean(meal.in_stock),
    is_chef_special: Boolean(meal.is_chef_special),
    has_spicy_level: Boolean(meal.has_spicy_level),
    has_addons: Boolean(meal.has_addons),
    allow_schedule_send: Boolean(meal.allow_schedule_send),
  });

  const saveMeal = (event: React.FormEvent) => {
    event.preventDefault();
    const { id: mealId, ...values } = mealForm;
    let variations = [];
    try { variations = JSON.parse(values.variations || "[]"); } catch { return showError("Variations must be valid JSON"); }
    run(`meal-${mealId}`, () => updateAdminMenuItem(mealId, {
      ...values,
      price: Number(values.price),
      discount: Number(values.discount || 0),
      inventory_quantity: values.inventory_quantity === "" ? null : Number(values.inventory_quantity),
      variations,
    }), "Meal updated").then(() => setMealForm({ ...mealDefaults }));
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="animate-spin text-green-600" size={38} /></div>;
  if (!record) return <div className="rounded-3xl bg-white p-10 text-center"><p className="font-bold text-slate-700">Application could not be loaded.</p><button onClick={onBack} className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Back</button></div>;

  const title = kind === "vendor"
    ? record.business_name || record.full_name || "Vendor application"
    : `${record.firstname || ""} ${record.lastname || ""}`.trim() || "Rider application";
  const sections = kind === "vendor" ? vendorSections : riderSections;

  return (
    <section className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm"><ArrowLeft size={17} /> {backLabel}</button>

      <div className="rounded-3xl bg-slate-950 p-5 text-white sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-green-500 text-slate-950">
            {kind === "vendor" && record.logo_url ? <img src={record.logo_url} alt="Vendor logo" className="h-full w-full object-cover" /> : kind === "rider" && record.profile_image ? <img src={record.profile_image} alt="Rider" className="h-full w-full object-cover" /> : kind === "vendor" ? <Store size={28} /> : <Truck size={28} />}
          </div>
          <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">{kind} application</p><h1 className="mt-1 truncate text-2xl font-black">{title}</h1><p className="truncate text-sm text-slate-400">{record.business_email || record.email}</p></div>
          <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase text-green-300">{record.status}</span>
        </div>
        {kind === "vendor" && <div className="mt-5 flex justify-end gap-2">{editingVendor ? <><button disabled={busy === "vendor-profile"} onClick={() => { setVendorForm(record); setEditingVendor(false); }} className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-black">Cancel</button><button disabled={busy === "vendor-profile"} onClick={saveVendor} className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-xs font-black text-slate-950 disabled:opacity-50">{busy === "vendor-profile" ? <Loader2 className="animate-spin" size={15}/> : <Save size={15}/>} Save all changes</button></> : <button onClick={() => setEditingVendor(true)} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-black"><Edit3 size={15}/> Edit vendor details</button>}</div>}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {sections.map(([heading, fields]) => <DetailSection key={heading} heading={heading} fields={fields} record={editingVendor && kind === "vendor" ? vendorForm : record} editing={editingVendor && kind === "vendor"} onChange={(key, value) => setVendorForm((current) => ({ ...current, [key]: value }))} />)}
      </div>

      {kind === "rider" && <>
        <MediaSection title="Submitted documents" items={[["Profile / face photo", record.profile_image, "image"], ["Government ID / KYC", record.id_document_url, "document"], ["Driver's licence", record.license_image, "image"]]} />
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">Guarantors</h2>{Array.isArray(record.guarantors) && record.guarantors.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{record.guarantors.map((item: Row, index: number) => <div key={item.id || index} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-800">{item.name}</p><p className="mt-1 text-sm text-slate-500">{item.relationship || "Relationship not supplied"}</p><a href={`tel:${item.phone}`} className="mt-2 block text-sm font-bold text-green-700">{item.phone}</a></div>)}</div> : <EmptyText text="No guarantor submitted" />}</section>
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">Bank information</h2>{record.bank_info ? <div className="mt-4"><FieldGrid record={record.bank_info} fields={[["bank_name", "Bank"], ["account_number", "Account number"], ["account_name", "Account name"]]} /></div> : <EmptyText text="No bank information submitted" />}</section>
      </>}

      {kind === "vendor" && <>
        <MediaSection title="Submitted documents and media" items={[["Logo", record.logo_url, "image"], ["Cover image", record.cover_url, "image"], ["Storefront photo", record.store_front_picture_url, "image"], ["Face verification video", record.face_video_url, "video"], ["Business licence", record.license_url, "document"], ...((record.business_documents || []).map((document: Row, index: number) => [document.name || `Business document ${index + 1}`, document.url, document.type || "document"]))]} />
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black text-slate-900">Vendor logo</h2><p className="text-sm text-slate-500">Upload a replacement image or remove the current logo.</p></div><div className="flex gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-xs font-black uppercase text-white"><Upload size={15} /> Replace<input type="file" accept="image/*" className="hidden" disabled={busy === "logo"} onChange={(event) => { const file = event.target.files?.[0]; if (file) run("logo", () => uploadAdminVendorLogo(id, file), "Logo replaced"); event.currentTarget.value = ""; }} /></label><button disabled={!record.logo_url || busy === "logo"} onClick={() => window.confirm("Remove this vendor logo?") && run("logo", () => deleteVendorLogo(id), "Logo removed")} className="rounded-xl bg-red-50 px-4 py-3 text-xs font-black uppercase text-red-600 disabled:opacity-40">Remove</button></div></div>
        </section>
        <MealManager meals={meals} busy={busy} mealForm={mealForm} setMealForm={setMealForm} editMeal={editMeal} saveMeal={saveMeal} run={run} />
      </>}

      <div className="sticky bottom-4 z-10 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
        <button disabled={busy === "decision"} onClick={() => decide(false)} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-xs font-black uppercase text-red-600 disabled:opacity-50"><XCircle size={17} /> Reject</button>
        <button disabled={busy === "decision"} onClick={() => decide(true)} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-black uppercase text-white disabled:opacity-50">{busy === "decision" ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />} Approve</button>
      </div>
    </section>
  );
}

function DetailSection({ heading, fields, record, editing = false, onChange }: { heading: string; fields: [string, string][]; record: Row; editing?: boolean; onChange?: (key: string, value: any) => void }) {
  return <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{heading}</h2><div className="mt-4"><FieldGrid record={record} fields={fields} editing={editing} onChange={onChange} /></div></section>;
}

function FieldGrid({ record, fields, editing = false, onChange }: { record: Row; fields: [string, string][]; editing?: boolean; onChange?: (key: string, value: any) => void }) {
  return <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{fields.map(([key, label]) => { const wide = key.includes("description") || key.includes("address") || key.endsWith("_url"); const canEdit = editing && !vendorReadOnlyFields.has(key); return <div key={key} className={wide ? "sm:col-span-2" : ""}><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt>{canEdit ? vendorBooleanFields.has(key) ? <label className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(record[key])} onChange={(event) => onChange?.(key, event.target.checked)} className="h-5 w-5 accent-green-600"/>{record[key] ? "Yes" : "No"}</label> : key === "business_name_status" ? <select value={record[key] || "approved"} onChange={(event) => onChange?.(key, event.target.value)} className="mt-1 w-full rounded-xl bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select> : wide && !key.endsWith("_url") ? <textarea value={record[key] ?? ""} onChange={(event) => onChange?.(key, event.target.value)} className="mt-1 min-h-24 w-full rounded-xl bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"/> : <input type={vendorNumberFields.has(key) ? "number" : key.includes("email") ? "email" : "text"} step={vendorNumberFields.has(key) ? "any" : undefined} value={record[key] ?? ""} onChange={(event) => onChange?.(key, vendorNumberFields.has(key) && event.target.value !== "" ? Number(event.target.value) : event.target.value)} className="mt-1 w-full rounded-xl bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"/> : <dd className="mt-1 break-words text-sm font-semibold text-slate-700">{formatValue(record[key])}</dd>}</div>; })}</dl>;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "Not submitted";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
}

function EmptyText({ text }: { text: string }) { return <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-400">{text}</p>; }

function MediaSection({ title, items }: { title: string; items: [string, any, string][] }) {
  return <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(([label, url, type]) => <article key={label} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"><div className="grid aspect-video place-items-center bg-slate-100">{url && type === "image" ? <img src={url} alt={label} className="h-full w-full object-cover" /> : url && type === "video" ? <video src={url} controls className="h-full w-full object-cover" /> : <FileImage className="text-slate-300" size={30} />}</div><div className="flex items-center justify-between gap-2 p-3"><p className="text-xs font-black text-slate-700">{label}</p>{url && <a href={url} target="_blank" rel="noreferrer" className="text-green-700" aria-label={`Open ${label}`}><ExternalLink size={15} /></a>}</div></article>)}</div></section>;
}

function MealManager({ meals, busy, mealForm, setMealForm, editMeal, saveMeal, run }: any) {
  return <section className="space-y-4"><div><h2 className="text-xl font-black text-slate-900">Meals and pictures</h2><p className="text-sm text-slate-500">All {meals.length} menu items, including unavailable and out-of-stock meals.</p></div>{mealForm.id && <form onSubmit={saveMeal} className="rounded-3xl border-2 border-green-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-black text-slate-900">Edit meal</h3><button type="button" onClick={() => setMealForm({ ...mealDefaults })} className="rounded-lg bg-slate-100 p-2"><X size={16} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })} placeholder="Meal name" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><input required type="number" min="0" step="0.01" value={mealForm.price} onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })} placeholder="Price" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><textarea value={mealForm.description || ""} onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })} placeholder="Description" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" /><input value={mealForm.category || ""} onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })} placeholder="Category" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><input type="number" min="0" step="0.01" value={mealForm.discount} onChange={(e) => setMealForm({ ...mealForm, discount: e.target.value })} placeholder="Discount" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><input value={mealForm.preparation_time || ""} onChange={(e) => setMealForm({ ...mealForm, preparation_time: e.target.value })} placeholder="Preparation time" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><input value={mealForm.tags || ""} onChange={(e) => setMealForm({ ...mealForm, tags: e.target.value })} placeholder="Tags" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><input type="number" min="0" value={mealForm.inventory_quantity} onChange={(e) => setMealForm({ ...mealForm, inventory_quantity: e.target.value })} placeholder="Inventory quantity (blank = unlimited)" className="rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2"/><textarea value={mealForm.variations} onChange={(e) => setMealForm({ ...mealForm, variations: e.target.value })} placeholder='Variations JSON: [{"name":"Large","price":2500}]' className="min-h-28 rounded-xl bg-slate-50 px-3 py-3 font-mono text-xs outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2"/><div className="grid grid-cols-2 gap-3 sm:col-span-2">{[["is_available", "Available"], ["in_stock", "In stock"], ["is_chef_special", "Chef special"], ["allow_schedule_send", "Can schedule"]].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-600"><input type="checkbox" checked={Boolean(mealForm[key])} onChange={(e) => setMealForm({ ...mealForm, [key]: e.target.checked })} className="h-4 w-4 accent-green-600" />{label}</label>)}</div></div><button disabled={busy === `meal-${mealForm.id}`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-black uppercase text-white disabled:opacity-50"><Save size={16} /> Save changes</button></form>}{meals.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">This vendor has no meals.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{meals.map((meal: Row) => <article key={meal.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"><div className="relative grid aspect-video place-items-center bg-slate-100">{meal.image_url ? <img src={meal.image_url} alt={meal.name} className="h-full w-full object-cover" /> : <ImageOff className="text-slate-300" size={34} />}<div className="absolute left-3 top-3 flex gap-1"><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${meal.is_available ? "bg-green-500 text-white" : "bg-slate-800 text-white"}`}>{meal.is_available ? "Available" : "Hidden"}</span>{!meal.in_stock && <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black uppercase text-white">Out of stock</span>}</div></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{meal.name}</h3><p className="text-xs text-slate-400">{meal.category || meal.item_type || "Uncategorised"}</p></div><p className="font-black text-green-700">₦{Number(meal.price || 0).toLocaleString()}</p></div><p className="mt-3 line-clamp-2 text-sm text-slate-500">{meal.description || "No description"}</p><p className="mt-2 text-xs text-slate-400">{meal.preparation_time || "No prep time"}{Number(meal.discount) > 0 ? ` · ${meal.discount}% discount` : ""}{meal.inventory_quantity != null ? ` · ${meal.inventory_quantity} left` : ""}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => editMeal(meal)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-black"><Edit3 size={14} /> Edit</button><button onClick={() => window.confirm(`Delete ${meal.name}?`) && run(`meal-${meal.id}`, () => deleteAdminMenuItem(meal.id), "Meal deleted")} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600"><Trash2 size={14} /> Delete</button><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-50 py-2.5 text-xs font-black text-green-700"><Upload size={14} /> Replace image<input type="file" accept="image/*" className="hidden" disabled={busy === `image-${meal.id}`} onChange={(event) => { const file = event.target.files?.[0]; if (file) run(`image-${meal.id}`, () => uploadAdminMenuItemImage(meal.id, file), "Meal image replaced"); event.currentTarget.value = ""; }} /></label><button disabled={!meal.image_url} onClick={() => window.confirm(`Remove ${meal.name}'s image?`) && run(`image-${meal.id}`, () => deleteMenuItemImage(meal.id), "Meal image removed")} className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-xs font-black text-amber-700 disabled:opacity-40"><ImageOff size={14} /> Remove image</button></div></div></article>)}</div>}</section>;
}
