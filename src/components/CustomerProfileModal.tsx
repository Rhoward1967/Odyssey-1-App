import { useState } from 'react';

// Shared customer profile modal for add/edit
export default function CustomerProfileModal({
  open,
  onClose,
  onSave,
  initialData = {},
}) {
  const [form, setForm] = useState({
    organization: '',
    first_name: '',
    last_name: '',
    emails: [''],
    phones: [''],
    addresses: [{ street: '', city: '', state: '', zip: '', country: '' }],
    customer_type: 'commercial',
    ...initialData,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit' : 'Add'} Client Profile</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="Organization / Company Name"
            value={form.organization}
            onChange={e => setForm({ ...form, organization: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          {/* Customer Type */}
          <div>
            <label className="block mb-1 font-semibold">Customer Type</label>
            <select
              className="w-full p-2 border rounded"
              value={form.customer_type}
              onChange={e => setForm({ ...form, customer_type: e.target.value })}
            >
              <option value="commercial">Business/Commercial</option>
              <option value="residential">Residential</option>
              <option value="government">Government</option>
              <option value="medical">Medical</option>
              <option value="educational">Educational</option>
            </select>
          </div>
          {/* Multiple Emails */}
          <div>
            <label className="block mb-1 font-semibold">Emails</label>
            {form.emails.map((email, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  type="email"
                  placeholder={`Email ${idx + 1}`}
                  value={email}
                  onChange={e => {
                    const emails = [...form.emails];
                    emails[idx] = e.target.value;
                    setForm({ ...form, emails });
                  }}
                  className="w-full p-2 border rounded"
                />
                {form.emails.length > 1 && (
                  <button type="button" onClick={() => {
                    const emails = form.emails.filter((_, i) => i !== idx);
                    setForm({ ...form, emails });
                  }} className="text-red-500">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, emails: [...form.emails, ''] })} className="text-blue-600 text-sm">+ Add Email</button>
          </div>
          {/* Multiple Phones */}
          <div>
            <label className="block mb-1 font-semibold">Phone Numbers</label>
            {form.phones.map((phone, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder={`Phone ${idx + 1}`}
                  value={phone}
                  onChange={e => {
                    const phones = [...form.phones];
                    phones[idx] = e.target.value;
                    setForm({ ...form, phones });
                  }}
                  className="w-full p-2 border rounded"
                />
                {form.phones.length > 1 && (
                  <button type="button" onClick={() => {
                    const phones = form.phones.filter((_, i) => i !== idx);
                    setForm({ ...form, phones });
                  }} className="text-red-500">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, phones: [...form.phones, ''] })} className="text-blue-600 text-sm">+ Add Phone</button>
          </div>
          {/* Multiple Addresses */}
          <div>
            <label className="block mb-1 font-semibold">Addresses</label>
            {form.addresses.map((address, idx) => (
              <div key={idx} className="mb-2 border p-2 rounded">
                <input
                  type="text"
                  placeholder="Street"
                  value={address.street}
                  onChange={e => {
                    const addresses = [...form.addresses];
                    addresses[idx].street = e.target.value;
                    setForm({ ...form, addresses });
                  }}
                  className="w-full p-2 border rounded mb-1"
                />
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={e => {
                      const addresses = [...form.addresses];
                      addresses[idx].city = e.target.value;
                      setForm({ ...form, addresses });
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={e => {
                      const addresses = [...form.addresses];
                      addresses[idx].state = e.target.value;
                      setForm({ ...form, addresses });
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={address.zip}
                    onChange={e => {
                      const addresses = [...form.addresses];
                      addresses[idx].zip = e.target.value;
                      setForm({ ...form, addresses });
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={address.country}
                    onChange={e => {
                      const addresses = [...form.addresses];
                      addresses[idx].country = e.target.value;
                      setForm({ ...form, addresses });
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
                {form.addresses.length > 1 && (
                  <button type="button" onClick={() => {
                    const addresses = form.addresses.filter((_, i) => i !== idx);
                    setForm({ ...form, addresses });
                  }} className="text-red-500 text-sm">Remove Address</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, addresses: [...form.addresses, { street: '', city: '', state: '', zip: '', country: '' }] })} className="text-blue-600 text-sm">+ Add Address</button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Save Client
          </button>
        </form>
      </div>
    </div>
  );
}
