import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createProspect, getProspect, updateProspect } from "../data/store";

const FIELDS = [
  { name: "name", label: "Nom du commerce", type: "text", required: true },
  { name: "activity", label: "Activité", type: "text", required: true },
  { name: "city", label: "Ville", type: "text", required: true },
  { name: "address", label: "Adresse", type: "text" },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "currentWebsite", label: "Site actuel", type: "text" },
  { name: "instagram", label: "Instagram", type: "text" },
];

const EMPTY_FORM = {
  name: "",
  activity: "",
  city: "",
  address: "",
  phone: "",
  currentWebsite: "",
  instagram: "",
  description: "",
};

export default function ProspectFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => {
    if (isEdit) {
      const existing = getProspect(id);
      if (existing) return { ...EMPTY_FORM, ...existing };
    }
    return EMPTY_FORM;
  });
  const [error, setError] = useState("");

  if (isEdit && !getProspect(id)) {
    return (
      <div className="empty-state">
        <p>Prospect introuvable.</p>
        <Link to="/" className="btn btn-primary">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.activity.trim() || !form.city.trim()) {
      setError("Nom du commerce, activité et ville sont obligatoires.");
      return;
    }
    setError("");

    if (isEdit) {
      updateProspect(id, form);
      navigate(`/prospects/${id}`);
    } else {
      const created = createProspect(form);
      navigate(`/prospects/${created.id}`);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? "Modifier le prospect" : "Nouveau prospect"}</h1>
          <p className="page-subtitle">
            {isEdit
              ? "Mettez à jour les informations de ce prospect."
              : "Renseignez les informations du commerce à prospecter."}
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          {FIELDS.map((field) => (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <Link
            to={isEdit ? `/prospects/${id}` : "/"}
            className="btn btn-ghost"
          >
            Annuler
          </Link>
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Enregistrer les modifications" : "Créer le prospect"}
          </button>
        </div>
      </form>
    </div>
  );
}
