// src/pages/StudentsPage.js

import React, { useState, useEffect, useCallback } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Alert, Badge, Modal, Btn, DataTable, Card, FormField, inputStyle } from "../components/UI";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useForm, useAsync } from "../hooks";

const BLANK = {
  StudentID:"", Name:"", Branch:"", Year:"1",
  Gender:"Male", Category:"General", Email:"", Phone:"", Password:""
};

const FIELDS = [
  { key:"StudentID", label:"Student ID",  type:"text",     addOnly:true,  ph:"e.g. 102417099" },
  { key:"Name",      label:"Full Name",   type:"text",     ph:"Full name" },
  { key:"Email",     label:"Email",       type:"email",    ph:"email@thapar.edu" },
  { key:"Branch",    label:"Branch",      type:"text",     ph:"CSE / ECE / ME…" },
  { key:"Year",      label:"Year",        type:"select",   opts:["1","2","3","4","5"] },
  { key:"Gender",    label:"Gender",      type:"select",   opts:["Male","Female","Other"] },
  { key:"Category",  label:"Category",    type:"select",   opts:["General","OBC","SC","ST","EWS"] },
  { key:"Phone",     label:"Phone",       type:"text",     ph:"+91…" },
  { key:"Password",  label:"Password",    type:"password", addOnly:true, ph:"Min 6 chars" },
];

export default function StudentsPage() {
  const { user }                  = useAuth();
  const [students, setStudents]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [modal,    setModal]      = useState(null); // null | "add" | "edit"
  const { form, fill, set }       = useForm(BLANK);
  const { run, loading: saving, error, success, clear } = useAsync();

  const load = useCallback(() => {
    setLoading(true);
    getStudents()
      .then(r => setStudents(r.data.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    fill(BLANK); clear(); setModal("add");
  };

  const openEdit = (s) => {
    fill({
      StudentID: s.StudentID, Name: s.Name, Branch: s.Branch,
      Year: String(s.Year), Gender: s.Gender, Category: s.Category,
      Email: s.Email, Phone: s.Phone || "", Password: "",
    });
    clear(); setModal("edit");
  };

  const save = async () => {
    try {
      if (modal === "add") {
        await run(() => createStudent(form));
      } else {
        await run(() => updateStudent(form.StudentID, form));
      }
      load();
      setTimeout(() => setModal(null), 1000);
    } catch {
      // error already set by useAsync
    }
  };

  const del = async (id) => {
    if (!window.confirm(`Delete student ${id}? This cannot be undone.`)) return;
    try {
      await deleteStudent(id);
      load();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  // Filter
  const q        = search.toLowerCase();
  const filtered = students.filter(s =>
    !q ||
    s.Name?.toLowerCase().includes(q) ||
    s.StudentID?.includes(q) ||
    s.Branch?.toLowerCase().includes(q) ||
    s.Email?.toLowerCase().includes(q)
  );

  // Table columns
  const columns = [
    { label:"ID",       key:"StudentID", style:{ fontWeight:600, color:"#378ADD", whiteSpace:"nowrap" } },
    { label:"Name",     render: s => <span style={{ fontWeight:500 }}>{s.Name}</span> },
    { label:"Branch",   key:"Branch" },
    { label:"Year",     key:"Year"   },
    { label:"Gender",   render: s => <Badge status={s.Gender}   /> },
    { label:"Category", render: s => <Badge status={s.Category} /> },
    { label:"Email",    key:"Email", style:{ fontSize:12, color:"#7A8499" } },
    { label:"Room Status", render: s => <Badge status={s.AllocStatus || "Unallocated"} /> },
    { label:"Actions",  render: s => (
      <div style={{ display:"flex", gap:6 }}>
        <Btn size="sm" variant="info"   onClick={() => openEdit(s)}>Edit</Btn>
        {user.role === "Admin" && (
          <Btn size="sm" variant="danger" onClick={() => del(s.StudentID)}>Del</Btn>
        )}
      </div>
    )},
  ];

  return (
    <PageLayout
      title="Student Management"
      actions={
        (user.role === "Admin" || user.role === "Warden") &&
        <Btn onClick={openAdd}>+ Add Student</Btn>
      }
    >
      {/* Search bar */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <input
          style={{ ...inputStyle, width:300 }}
          placeholder="Search by name, ID, branch or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ fontSize:12, color:"#7A8499" }}>
          {filtered.length} / {students.length} students
        </span>
      </div>

      {/* Table */}
      <Card>
        {loading
          ? <Spinner />
          : <DataTable columns={columns} rows={filtered} emptyMsg="No students found" />
        }
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Register New Student" : "Edit Student"}
        width={520}
      >
        {error   && <Alert type="error"   msg={error}   />}
        {success && <Alert type="success" msg={success} />}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          {FIELDS
            .filter(f => modal === "add" || !f.addOnly)
            .map(f => (
              <FormField key={f.key} label={f.label}>
                {f.type === "select"
                  ? (
                    <select
                      style={inputStyle}
                      value={form[f.key] || f.opts[0]}
                      onChange={e => set(f.key, e.target.value)}
                    >
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      style={inputStyle}
                      type={f.type}
                      placeholder={f.ph || ""}
                      value={form[f.key] || ""}
                      onChange={e => set(f.key, e.target.value)}
                    />
                  )
                }
              </FormField>
            ))
          }
        </div>

        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <Btn style={{ flex:1, padding:"10px 0" }} onClick={save} disabled={saving}>
            {saving ? "Saving…" : modal === "add" ? "Register Student" : "Save Changes"}
          </Btn>
          <Btn variant="ghost" style={{ flex:1, padding:"10px 0" }} onClick={() => setModal(null)}>
            Cancel
          </Btn>
        </div>
      </Modal>
    </PageLayout>
  );
}
