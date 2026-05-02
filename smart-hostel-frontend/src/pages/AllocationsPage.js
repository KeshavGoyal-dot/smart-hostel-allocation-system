// src/pages/AllocationsPage.js

import React, { useState, useEffect, useCallback } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Alert, Badge, Modal, Btn, Card, DataTable, FormField, inputStyle } from "../components/UI";
import { getAllocations, allocateRoom, vacateRoom } from "../services/api";
import { useAsync } from "../hooks";

// ── Allocate / Vacate action modal ────────────────────────────
function ActionModal({ open, onClose, type, onDone }) {
  const [sid, setSid]                          = useState("");
  const { run, loading, error, success, clear } = useAsync();
  const isAlloc                                = type === "allocate";

  // Reset when modal opens
  useEffect(() => { if (open) { setSid(""); clear(); } }, [open]); // eslint-disable-line

  const submit = async () => {
    if (!sid.trim()) return;
    try {
      await run(() => isAlloc ? allocateRoom(sid.trim()) : vacateRoom(sid.trim()));
      onDone();
      setTimeout(onClose, 1200);
    } catch {
      // error shown via useAsync
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAlloc ? "Allocate Room to Student" : "Vacate Room"}
      width={440}
    >
      <p style={{ color:"#7A8499", fontSize:12, marginTop:0, lineHeight:1.6 }}>
        {isAlloc
          ? "Calls sp_allocate_room stored procedure. Automatically finds the best available room matching the student's gender and hostel type. If no room is available, the student is added to the waitlist."
          : "Calls sp_vacate_room stored procedure. After vacating, sp_process_waitlist runs automatically to allocate rooms to waitlisted students."
        }
      </p>

      {error   && <Alert type="error"   msg={error}   />}
      {success && <Alert type="success" msg={success} />}

      <FormField label="Student ID">
        <input
          style={inputStyle}
          placeholder="e.g. 102417031"
          value={sid}
          onChange={e => setSid(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          autoFocus
        />
      </FormField>

      <div style={{ display:"flex", gap:10 }}>
        <Btn
          variant={isAlloc ? "primary" : "danger"}
          style={{ flex:1, padding:"10px 0" }}
          onClick={submit}
          disabled={loading || !sid.trim()}
        >
          {loading ? "Processing…" : isAlloc ? "🔑 Allocate Room" : "🚪 Vacate Room"}
        </Btn>
        <Btn variant="ghost" style={{ flex:1, padding:"10px 0" }} onClick={onClose}>
          Cancel
        </Btn>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AllocationsPage() {
  const [allocs,  setAllocs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // "allocate" | "vacate" | null

  const load = useCallback(() => {
    setLoading(true);
    getAllocations()
      .then(r => setAllocs(r.data.data || []))
      .catch(() => setAllocs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { label:"#",       render: a => <span style={{ color:"#7F77DD", fontWeight:600 }}>#{a.AllocID}</span> },
    { label:"Student", render: a => (
      <div>
        <div style={{ fontWeight:500, color:"#1A2332" }}>{a.Name}</div>
        <div style={{ fontSize:11, color:"#7A8499" }}>{a.StudentID}</div>
      </div>
    )},
    { label:"Branch",  key:"Branch" },
    { label:"Year",    key:"Year"   },
    { label:"Hostel",  key:"HostelName", style:{ fontSize:12 } },
    { label:"Block",   key:"BlockName"  },
    { label:"Room",    key:"RoomNo",    style:{ fontWeight:700 } },
    { label:"Type",    key:"RoomType"   },
    { label:"Date",    render: a => (
      <span style={{ fontSize:12, color:"#7A8499" }}>{a.AllocDate?.split("T")[0]}</span>
    )},
    { label:"Status",  render: a => <Badge status={a.Status} /> },
  ];

  // Summary stats
  const byHostel = allocs.reduce((acc, a) => {
    acc[a.HostelName] = (acc[a.HostelName] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageLayout
      title="Room Allocations"
      actions={
        <>
          <Btn onClick={() => setModal("allocate")}>🔑 Allocate Room</Btn>
          <Btn variant="danger" onClick={() => setModal("vacate")}>🚪 Vacate Room</Btn>
        </>
      }
    >
      {/* Summary mini-cards */}
      <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #E8EBF0", padding:"14px 20px", borderLeft:"3px solid #1D9E75" }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#1A2332" }}>{allocs.length}</div>
          <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px" }}>Active Allocations</div>
        </div>
        {Object.entries(byHostel).map(([name, count]) => (
          <div key={name} style={{ background:"#fff", borderRadius:10, border:"1px solid #E8EBF0", padding:"14px 20px" }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#1A2332" }}>{count}</div>
            <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px" }}>
              {name.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card title={`Active Allocations (${allocs.length})`}>
        {loading
          ? <Spinner />
          : <DataTable columns={columns} rows={allocs} emptyMsg="No active allocations found" />
        }
      </Card>

      {/* Modals */}
      <ActionModal open={modal === "allocate"} onClose={() => setModal(null)} type="allocate" onDone={load} />
      <ActionModal open={modal === "vacate"}   onClose={() => setModal(null)} type="vacate"   onDone={load} />
    </PageLayout>
  );
}
