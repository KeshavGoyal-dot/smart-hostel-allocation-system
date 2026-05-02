// src/pages/WaitlistPage.js

import React, { useState, useEffect, useCallback } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Alert, Badge, Btn, Card, DataTable } from "../components/UI";
import { getWaitlist, removeFromWaitlist } from "../services/api";

export default function WaitlistPage() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState({ type:"", text:"" });

  const load = useCallback(() => {
    setLoading(true);
    getWaitlist()
      .then(r => setList(r.data.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm("Remove this student from the waitlist?")) return;
    try {
      await removeFromWaitlist(id);
      setMsg({ type:"success", text:"Removed from waitlist." });
      load();
    } catch (err) {
      setMsg({ type:"error", text: err.message });
    }
  };

  // Sort: priority DESC, then request date ASC (FIFO)
  const sorted = [...list].sort(
    (a, b) => b.Priority - a.Priority || (a.RequestDate > b.RequestDate ? 1 : -1)
  );

  const columns = [
    { label:"Rank",     render: (_, i) => <span style={{ color:"#7A8499", fontWeight:700 }}>#{i + 1}</span> },
    { label:"Student ID", key:"StudentID", style:{ fontWeight:600, color:"#378ADD" } },
    { label:"Name",     render: w => <span style={{ fontWeight:500 }}>{w.Name}</span> },
    { label:"Branch",   key:"Branch" },
    { label:"Year",     key:"Year"   },
    { label:"Gender",   render: w => <Badge status={w.Gender}   /> },
    { label:"Category", render: w => <Badge status={w.Category} /> },
    { label:"Priority Score", render: w => (
      <span style={{
        fontWeight:700, fontSize:16,
        color: w.Priority >= 40 ? "#1D9E75" : w.Priority >= 25 ? "#BA7517" : "#7A8499"
      }}>
        {w.Priority}
      </span>
    )},
    { label:"Requested", render: w => (
      <span style={{ fontSize:12, color:"#7A8499" }}>{w.RequestDate?.split("T")[0]}</span>
    )},
    { label:"Action", render: w => (
      <Btn size="sm" variant="danger" onClick={() => remove(w.StudentID)}>Remove</Btn>
    )},
  ];

  return (
    <PageLayout title="Waiting List">
      <Alert type={msg.type} msg={msg.text} />

      {/* Info strip */}
      <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
        {[
          { label:"Total Waitlisted", value: list.length, color:"#BA7517" },
          { label:"Highest Priority", value: sorted[0]?.Priority ?? "—", color:"#1D9E75" },
          { label:"Avg Priority",
            value: list.length
              ? Math.round(list.reduce((s,w) => s + w.Priority, 0) / list.length)
              : "—",
            color:"#378ADD" },
        ].map(s => (
          <div key={s.label} style={{
            background:"#fff", borderRadius:10, border:"1px solid #E8EBF0",
            padding:"14px 20px", borderLeft:`3px solid ${s.color}`
          }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#1A2332" }}>{s.value}</div>
            <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px", marginTop:3 }}>{s.label}</div>
          </div>
        ))}

        {/* Priority formula explanation */}
        <div style={{
          background:"#F8FDF9", borderRadius:10, border:"1px solid #9FE1CB",
          padding:"14px 18px", fontSize:12, color:"#0F6E56", maxWidth:360, lineHeight:1.6
        }}>
          <strong>Priority Formula:</strong> Year × 10 + Category bonus
          (SC/ST +15, EWS +12, OBC +10). Higher score = allocated first.
        </div>
      </div>

      <Card title={`Waiting List — ${list.length} students  ·  sorted by Priority → FIFO`}>
        {loading
          ? <Spinner />
          : <DataTable columns={columns} rows={sorted} emptyMsg="Waiting list is empty 🎉" />
        }
      </Card>
    </PageLayout>
  );
}
