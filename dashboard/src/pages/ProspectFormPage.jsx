import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createProspect, getProspect, updateProspect } from "../data/store";
import {
  createEmptyProspectFields,
  createEmptyService,
} from "../data/prospectFields";

const IDENTITY_FIELDS = [
  { name: "name", label: "Nom du commerce", type: "text", required: true },
  { name: "activity", label: "Activité", type: "text", required: true },
  { name: "address", label: "Adresse", type: "text" },
  { name: "city", label: "Ville", type: "text", required: true },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
];

const ONLINE_PRESENCE_FIELDS = [
  { name: "currentWebsite", label: "Site actuel", type: "text" },
  { name: "instagram", label: "Instagram", type: "text" },
  { name: "facebook", label: "Facebook", type: "text" },
];

export default function ProspectFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => {
    if (isEdit) {
      const existing = getProspect(id);
      if (existing) return { ...createEmptyProspectFields(), ...existing };
    }
    return createEmptyProspectFields();
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

  function handleHourChange(index, value) {
    setForm((f) => {
      const hours = [...f.hours];
      hours[index] = { ...hours[index], hours: value };
      return { ...f, hours };
    });
  }

  function handleServiceChange(index, key, value) {
    setForm((f) => {
      const services = [...f.services];
      services[index] = { ...services[index], [key]: value };
      return { ...f, services };
    });
  }

  function handleAddService() {
    setForm((f) => ({ ...f, services: [...f.services, createEmptyService()] }));
  }

  function handleRemoveService(index) {
    setForm((f) => ({
      ...f,
      services: f.services.filter((_, i) => i !== index),
    }));
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

        <section className="form-section">
          <h2 className="form-section-title">Identité</h2>
          <div className="form-grid">
            {IDENTITY_FIELDS.map((field) => (
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
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Présence en ligne</h2>
          <div className="form-grid">
            {ONLINE_PRESENCE_FIELDS.map((field) => (
              <div className="form-field" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
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
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Contenu</h2>
          <div className="form-field">
            <label htmlFor="description">Description du commerce</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Services</label>
            <div className="service-rows">
              {form.services.map((service, index) => (
                <div className="service-row" key={index}>
                  <input
                    placeholder="Nom (ex. Coupe homme)"
                    value={service.name}
                    onChange={(e) =>
                      handleServiceChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    placeholder="Description"
                    value={service.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                  />
                  <input
                    className="service-row-price"
                    placeholder="Prix (ex. 25€)"
                    value={service.price}
                    onChange={(e) =>
                      handleServiceChange(index, "price", e.target.value)
                    }
                  />
                  <input
                    className="service-row-duration"
                    placeholder="Durée (ex. 30 min)"
                    value={service.duration}
                    onChange={(e) =>
                      handleServiceChange(index, "duration", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="service-row-remove"
                    aria-label="Supprimer ce service"
                    onClick={() => handleRemoveService(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={handleAddService}
            >
              + Ajouter un service
            </button>
          </div>

          <div className="form-field">
            <label>Horaires</label>
            <div className="hours-rows">
              {form.hours.map((entry, index) => (
                <div className="hours-row" key={entry.day}>
                  <span className="hours-row-day">{entry.day}</span>
                  <input
                    placeholder="ex. 9h00 - 19h00, ou Fermé"
                    value={entry.hours}
                    onChange={(e) => handleHourChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Commercial</h2>
          <div className="form-field">
            <label htmlFor="internalNotes">Notes internes</label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              placeholder="Notes visibles uniquement dans le dashboard (non publiées sur le site)."
              value={form.internalNotes}
              onChange={handleChange}
            />
          </div>
        </section>

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
