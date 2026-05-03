# research tracker.jsx
**Classification:** Legal Research | Sovereign Reference | Living Document
**R.O.M.A.N. Tag:** legal_drafting | sovereign_notice | fcra_response | accountability_doctrine | truth_standard
**Author:** Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
**Source:** Primary research document

---

import { useState } from "react";



const INITIAL_QUEUE = [

  // PART I

  { id: 1, part: "Part I", item: "1790 Census state by state demographic breakdown", status: "RESEARCH NEEDED", notes: "Total population 3,929,214 confirmed. State breakdown not yet incorporated.", updated: "April 2026" },

  { id: 2, part: "Part I", item: "Johnson v. M'Intosh 1823 full opinion review", status: "RESEARCH NEEDED", notes: "Case documented. Full opinion analysis against modern property law not completed.", updated: "April 2026" },

  { id: 3, part: "Part I", item: "Chain of title — Doctrine of Discovery to Church Commissioners mineral rights", status: "RESEARCH NEEDED", notes: "Both endpoints documented. Historical chain not yet traced.", updated: "April 2026" },

  // PART II

  { id: 4, part: "Part II", item: "Anti-Federalist Papers beyond Brutus — Centinel Federal Farmer Cato", status: "RESEARCH NEEDED", notes: "Brutus 1-16 documented. Other Anti-Federalist writers not yet incorporated.", updated: "April 2026" },

  { id: 5, part: "Part II", item: "Federalist 10 — Madison on factions — primary source text", status: "RESEARCH NEEDED", notes: "Referenced but not yet added to document.", updated: "April 2026" },

  { id: 6, part: "Part II", item: "Federalist 48 — Madison on parchment barriers — primary source text", status: "RESEARCH NEEDED", notes: "Referenced. Not yet incorporated.", updated: "April 2026" },

  // PART III

  { id: 7, part: "Part III", item: "Wright Patman congressional record 1971-1973", status: "RESEARCH NEEDED", notes: "Referenced. Specific congressional testimony not yet located.", updated: "April 2026" },

  { id: 8, part: "Part III", item: "Sovereign Wealth Fund formal establishment", status: "ANALYTICAL PREDICTION", notes: "EO 14196 confirmed. Fund not formally established as of April 2026. Monitor for congressional authorization question.", updated: "April 2026" },

  { id: 9, part: "Part III", item: "Federal Reserve Act full congressional record December 23 1913", status: "RESEARCH NEEDED", notes: "Passage documented. Full debate record not yet incorporated.", updated: "April 2026" },

  // PART V

  { id: 10, part: "Part V", item: "Specific regulatory text mandating automated freeze/burn without judicial warrant", status: "RESEARCH NEEDED", notes: "Statutory text confirms agency orders can trigger without court order. Specific automation mandate not yet located.", updated: "April 2026" },

  { id: 11, part: "Part V", item: "5th Amendment due process challenge to GENIUS Act freeze mechanism", status: "RESEARCH NEEDED", notes: "Research question identified. Legal analysis not completed.", updated: "April 2026" },

  { id: 12, part: "Part V", item: "ISO 20022 technical specifications for freeze and burn functions", status: "RESEARCH NEEDED", notes: "ERC-20 and ISO 20022 referenced. Technical spec primary source not yet cited.", updated: "April 2026" },

  // PART X

  { id: 13, part: "Part X", item: "Brutus essays 2 through 10 primary source text", status: "RESEARCH NEEDED", notes: "Essays 1 and 11-16 documented. Essays 2-10 not yet incorporated.", updated: "April 2026" },

  { id: 14, part: "Part X", item: "Brutus 16 full primary source text", status: "RESEARCH NEEDED", notes: "Publication date confirmed. Full text not yet retrieved.", updated: "April 2026" },

  // PART XI / XII

  { id: 15, part: "Part XII", item: "Iraqi NY Fed 2026 financial leash — stronger primary source", status: "RESEARCH NEEDED", notes: "Arab Weekly and Reuters January 2026 confirm general claim. Specific documented threat needs stronger citation.", updated: "April 2026" },

  { id: 16, part: "Part XII", item: "National Energy Dominance Council formal recommendations — 100-day plan", status: "RESEARCH NEEDED", notes: "Council established February 14 2025. Plan was due May 25 2025. Content not yet located.", updated: "April 2026" },

  { id: 17, part: "Part XII", item: "Sovereign Wealth Fund plan submitted by Treasury and Commerce — content", status: "RESEARCH NEEDED", notes: "CBS News confirmed plan submitted. White House pushed back. Content not yet located.", updated: "April 2026" },

  { id: 18, part: "Part XII", item: "Minnesota Medicaid withholding court final outcome", status: "RESEARCH NEEDED", notes: "Initial ruling documented April 2026. Final outcome pending.", updated: "April 2026" },

];



const REMOVED = [

  { id: 99, part: "All", item: "Chairman Protocol as named federal directive", reason: "Searched Federal Register, White House EOs, Congressional records. Term does not appear as official federal program name. Replaced with documented War on Fraud EO.", removed: "April 2026" },

];



const STATUS_COLORS = {

  "ESTABLISHED": "bg-green-100 text-green-800",

  "RESEARCH NEEDED": "bg-yellow-100 text-yellow-800",

  "IN PROGRESS": "bg-blue-100 text-blue-800",

  "ANALYTICAL PREDICTION": "bg-purple-100 text-purple-800",

  "REMOVED": "bg-red-100 text-red-800",

};



const STATUSES = ["RESEARCH NEEDED", "IN PROGRESS", "ESTABLISHED", "ANALYTICAL PREDICTION", "REMOVED"];



export default function ResearchTracker() {

  const [queue, setQueue] = useState(INITIAL_QUEUE);

  const [filter, setFilter] = useState("ALL");

  const [partFilter, setPartFilter] = useState("ALL");

  const [editId, setEditId] = useState(null);

  const [editData, setEditData] = useState({});

  const [showAdd, setShowAdd] = useState(false);

  const [newItem, setNewItem] = useState({ part: "Part I", item: "", status: "RESEARCH NEEDED", notes: "", updated: "April 2026" });

  const [showRemoved, setShowRemoved] = useState(false);



  const parts = ["ALL", ...Array.from(new Set(queue.map(q => q.part))).sort()];



  const filtered = queue.filter(q => {

    const statusMatch = filter === "ALL" || q.status === filter;

    const partMatch = partFilter === "ALL" || q.part === partFilter;

    return statusMatch && partMatch;

  });



  const counts = STATUSES.reduce((acc, s) => {

    acc[s] = queue.filter(q => q.status === s).length;

    return acc;

  }, {});



  const startEdit = (item) => {

    setEditId(item.id);

    setEditData({ ...item });

  };



  const saveEdit = () => {

    setQueue(queue.map(q => q.id === editId ? { ...editData, updated: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) } : q));

    setEditId(null);

  };



  const addItem = () => {

    const id = Math.max(...queue.map(q => q.id)) + 1;

    setQueue([...queue, { ...newItem, id, updated: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) }]);

    setNewItem({ part: "Part I", item: "", status: "RESEARCH NEEDED", notes: "", updated: "" });

    setShowAdd(false);

  };



  return (

    <div className="min-h-screen bg-gray-50 p-4">

      <div className="max-w-6xl mx-auto">



        {/* Header */}

        <div className="bg-gray-900 text-white rounded-lg p-6 mb-6">

          <h1 className="text-xl font-bold mb-1">Judgement of No Legal Accountability</h1>

          <p className="text-gray-400 text-sm">Active Research Queue — Living Document Tracker</p>

          <p className="text-gray-500 text-xs mt-1">Rickey Howard — Athens GA — Version 13.0 — April 2026</p>

        </div>



        {/* Stats */}

        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">

          {[

            { label: "Research Needed", key: "RESEARCH NEEDED", color: "border-yellow-400" },

            { label: "In Progress", key: "IN PROGRESS", color: "border-blue-400" },

            { label: "Established", key: "ESTABLISHED", color: "border-green-400" },

            { label: "Analytical Prediction", key: "ANALYTICAL PREDICTION", color: "border-purple-400" },

          ].map(s => (

            <div key={s.key} className={`bg-white rounded-lg p-4 border-l-4 ${s.color} shadow-sm`}>

              <div className="text-2xl font-bold text-gray-900">{counts[s.key] || 0}</div>

              <div className="text-xs text-gray-500 mt-1">{s.label}</div>

            </div>

          ))}

        </div>



        {/* Filters */}

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">

          <div>

            <label className="text-xs text-gray-500 block mb-1">Filter by Status</label>

            <select className="border rounded px-2 py-1 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>

              <option value="ALL">All Statuses</option>

              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}

            </select>

          </div>

          <div>

            <label className="text-xs text-gray-500 block mb-1">Filter by Part</label>

            <select className="border rounded px-2 py-1 text-sm" value={partFilter} onChange={e => setPartFilter(e.target.value)}>

              {parts.map(p => <option key={p} value={p}>{p}</option>)}

            </select>

          </div>

          <div className="ml-auto">

            <button onClick={() => setShowAdd(!showAdd)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700">

              + Add Research Item

            </button>

          </div>

        </div>



        {/* Add New Item */}

        {showAdd && (

          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">

            <h3 className="font-semibold text-sm mb-3">Add New Research Item</h3>

            <div className="grid gap-3">

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="text-xs text-gray-500 block mb-1">Part</label>

                  <input className="border rounded px-2 py-1 text-sm w-full" value={newItem.part} onChange={e => setNewItem({ ...newItem, part: e.target.value })} placeholder="e.g. Part III" />

                </div>

                <div>

                  <label className="text-xs text-gray-500 block mb-1">Status</label>

                  <select className="border rounded px-2 py-1 text-sm w-full" value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })}>

                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}

                  </select>

                </div>

              </div>

              <div>

                <label className="text-xs text-gray-500 block mb-1">Research Item</label>

                <input className="border rounded px-2 py-1 text-sm w-full" value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} placeholder="Describe the research item..." />

              </div>

              <div>

                <label className="text-xs text-gray-500 block mb-1">Notes</label>

                <textarea className="border rounded px-2 py-1 text-sm w-full" rows={2} value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Current status, what is known, what is needed..." />

              </div>

              <div className="flex gap-2">

                <button onClick={addItem} className="bg-green-700 text-white px-4 py-1 rounded text-sm hover:bg-green-600">Add to Queue</button>

                <button onClick={() => setShowAdd(false)} className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-300">Cancel</button>

              </div>

            </div>

          </div>

        )}



        {/* Queue Items */}

        <div className="space-y-3 mb-6">

          {filtered.length === 0 && (

            <div className="bg-white rounded-lg p-6 text-center text-gray-400 text-sm shadow-sm">No items match current filters.</div>

          )}

          {filtered.map(item => (

            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">

              {editId === item.id ? (

                <div className="grid gap-3">

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label className="text-xs text-gray-500 block mb-1">Part</label>

                      <input className="border rounded px-2 py-1 text-sm w-full" value={editData.part} onChange={e => setEditData({ ...editData, part: e.target.value })} />

                    </div>

                    <div>

                      <label className="text-xs text-gray-500 block mb-1">Status</label>

                      <select className="border rounded px-2 py-1 text-sm w-full" value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>

                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}

                      </select>

                    </div>

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 block mb-1">Item</label>

                    <input className="border rounded px-2 py-1 text-sm w-full" value={editData.item} onChange={e => setEditData({ ...editData, item: e.target.value })} />

                  </div>

                  <div>

                    <label className="text-xs text-gray-500 block mb-1">Notes</label>

                    <textarea className="border rounded px-2 py-1 text-sm w-full" rows={3} value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} />

                  </div>

                  <div className="flex gap-2">

                    <button onClick={saveEdit} className="bg-green-700 text-white px-4 py-1 rounded text-sm hover:bg-green-600">Save</button>

                    <button onClick={() => setEditId(null)} className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-300">Cancel</button>

                  </div>

                </div>

              ) : (

                <div className="flex items-start gap-3">

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-1 flex-wrap">

                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.part}</span>

                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-700"}`}>{item.status}</span>

                    </div>

                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.item}</p>

                    <p className="text-xs text-gray-500">{item.notes}</p>

                    <p className="text-xs text-gray-300 mt-1">Last updated: {item.updated}</p>

                  </div>

                  <button onClick={() => startEdit(item)} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border rounded hover:border-gray-400 whitespace-nowrap">Edit</button>

                </div>

              )}

            </div>

          ))}

        </div>



        {/* Removed Items */}

        <div className="mb-6">

          <button onClick={() => setShowRemoved(!showRemoved)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">

            <span>{showRemoved ? "▼" : "▶"}</span>

            <span>Removed Items ({REMOVED.length})</span>

          </button>

          {showRemoved && (

            <div className="mt-3 space-y-2">

              {REMOVED.map(item => (

                <div key={item.id} className="bg-red-50 rounded-lg p-4 border border-red-100">

                  <div className="flex items-center gap-2 mb-1">

                    <span className="text-xs font-semibold text-gray-400 uppercase">{item.part}</span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">REMOVED</span>

                    <span className="text-xs text-gray-400">{item.removed}</span>

                  </div>

                  <p className="text-sm font-semibold text-gray-700 mb-1">{item.item}</p>

                  <p className="text-xs text-gray-500">{item.reason}</p>

                </div>

              ))}

            </div>

          )}

        </div>



        {/* Instructions */}

        <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-500">

          <p className="font-semibold text-gray-700 mb-2">How to use this tracker</p>

          <p className="mb-1">When returning to research — check this tracker first. Find the item. Click Edit to update its status and notes.</p>

          <p className="mb-1">When a primary source is found — change status to ESTABLISHED and add the source in notes. Then update the document.</p>

          <p className="mb-1">When a new research question emerges — click Add Research Item. Assign it to the correct Part.</p>

          <p>When something is disproven — change status to REMOVED and note why. Document integrity depends on tracking what was removed and why.</p>

        </div>



      </div>

    </div>

  );

}




