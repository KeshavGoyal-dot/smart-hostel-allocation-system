// src/pages/HostelsPage.js

import React, { useState, useEffect, useCallback } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Alert, Badge, Modal, Btn, Card, DataTable, ProgressBar, FormField, inputStyle } from "../components/UI";
import { getHostels, getHostelRooms, createHostel, addRoom } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useForm, useAsync } from "../hooks";

const pct = h =>
  h.TotalCapacity > 0 ? Math.round((h.TotalOccupied / h.TotalCapacity) * 100) : 0;

export default function HostelsPage() {
  const { user }                     = useAuth();
  const [hostels,   setHostels]      = useState([]);
  const [rooms,     setRooms]        = useState([]);
  const [selH,      setSelH]         = useState(null);
  const [loading,   setLoading]      = useState(true);
  const [loadR,     setLoadR]        = useState(false);
  const [modal,     setModal]        = useState(null); // "hostel" | "room" | null

  const { form: hForm, fill: fillH, set: setH } = useForm({ HostelName:"", Type:"Boys", TotalBlocks:1 });
  const { form: rForm, fill: fillR, set: setR } = useForm({ BlockID:"", RoomNo:"", Capacity:2, RoomType:"Double" });
  const { run, loading: saving, error, success, clear } = useAsync();

  const load = useCallback(() => {
    setLoading(true);
    getHostels()
      .then(r => setHostels(r.data.data || []))
      .catch(() => setHostels([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewRooms = (h) => {
    setSelH(h);
    setLoadR(true);
    getHostelRooms(h.HostelID)
      .then(r => setRooms(r.data.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoadR(false));
  };

  const saveHostel = async () => {
    try {
      await run(() => createHostel(hForm));
      load();
      setTimeout(() => setModal(null), 900);
    } catch {}
  };

  const saveRoom = async () => {
    try {
      await run(() => addRoom(selH.HostelID, rForm.BlockID, rForm));
      viewRooms(selH);
      setTimeout(() => setModal(null), 900);
    } catch {}
  };

  const openHostelModal = () => {
    fillH({ HostelName:"", Type:"Boys", TotalBlocks:1 });
    clear(); setModal("hostel");
  };

  const openRoomModal = () => {
    fillR({ BlockID:"", RoomNo:"", Capacity:2, RoomType:"Double" });
    clear(); setModal("room");
  };

  const roomCols = [
    { label:"Room No",  key:"RoomNo",       style:{ fontWeight:600 } },
    { label:"Block",    key:"BlockName"  },
    { label:"Type",     key:"RoomType"   },
    { label:"Capacity", key:"Capacity"   },
    { label:"Occupied", key:"OccupiedSeats" },
    { label:"Free",     key:"FreeSeats"  },
    { label:"Status",   render: r => <Badge status={r.FreeSeats > 0 ? "Active" : "Vacated"} /> },
  ];

  return (
    <PageLayout
      title="Hostels & Rooms"
      actions={
        user.role === "Admin" &&
        <Btn onClick={openHostelModal}>+ Add Hostel</Btn>
      }
    >
      {/* Summary stats */}
      <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap" }}>
        {[
          { label:"Total Hostels",  value: hostels.length },
          { label:"Total Capacity", value: hostels.reduce((s,h) => s + (h.TotalCapacity||0), 0) },
          { label:"Occupied Seats", value: hostels.reduce((s,h) => s + (h.TotalOccupied||0),  0) },
          { label:"Free Seats",     value: hostels.reduce((s,h) => s + (h.AvailableSeats||0), 0) },
        ].map(s => (
          <div key={s.label} style={{
            background:"#fff", borderRadius:10, border:"1px solid #E8EBF0",
            padding:"14px 20px", borderLeft:"3px solid #1D9E75",
          }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#1A2332" }}>{s.value}</div>
            <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px", marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hostel cards */}
      {loading ? <Spinner /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:14, marginBottom:20 }}>
          {hostels.map(h => {
            const p      = pct(h);
            const active = selH?.HostelID === h.HostelID;
            return (
              <div
                key={h.HostelID}
                onClick={() => viewRooms(h)}
                style={{
                  background:"#fff", borderRadius:12, cursor:"pointer",
                  border:`2px solid ${active ? "#1D9E75" : "#E8EBF0"}`,
                  padding:"20px 22px", transition:"all 0.18s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor="#1D9E75"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor="#E8EBF0"; }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:"#1A2332", marginBottom:6 }}>{h.HostelName}</div>
                    <Badge status={h.Type} />
                  </div>
                  <span style={{ fontSize:26 }}>{h.Type === "Boys" ? "🏗" : "🏘"}</span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                  {[["Rooms", h.TotalRooms||0], ["Occupied", h.TotalOccupied||0], ["Free", h.AvailableSeats||0]].map(([l,v]) => (
                    <div key={l} style={{ background:"#F4F6F9", borderRadius:8, padding:"8px 0", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:"#1A2332" }}>{v}</div>
                      <div style={{ fontSize:9, color:"#7A8499", textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>

                <ProgressBar pct={p} />
              </div>
            );
          })}
        </div>
      )}

      {/* Room listing panel */}
      {selH && (
        <Card
          title={`Rooms — ${selH.HostelName}`}
          action={
            <div style={{ display:"flex", gap:8 }}>
              {(user.role === "Admin" || user.role === "Warden") && (
                <Btn size="sm" onClick={openRoomModal}>+ Add Room</Btn>
              )}
              <Btn size="sm" variant="ghost" onClick={() => { setSelH(null); setRooms([]); }}>
                ✕ Close
              </Btn>
            </div>
          }
        >
          {loadR
            ? <Spinner />
            : <DataTable columns={roomCols} rows={rooms} emptyMsg="No rooms in this hostel yet" />
          }
        </Card>
      )}

      {/* Add Hostel Modal */}
      <Modal open={modal === "hostel"} onClose={() => setModal(null)} title="Add New Hostel" width={420}>
        {error   && <Alert type="error"   msg={error}   />}
        {success && <Alert type="success" msg={success} />}
        <FormField label="Hostel Name">
          <input style={inputStyle} placeholder="e.g. Narmada Boys Hostel"
            value={hForm.HostelName} onChange={e => setH("HostelName", e.target.value)} />
        </FormField>
        <FormField label="Type">
          <select style={inputStyle} value={hForm.Type} onChange={e => setH("Type", e.target.value)}>
            {["Boys","Girls","Mixed"].map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Total Blocks">
          <input style={inputStyle} type="number" min={1} value={hForm.TotalBlocks}
            onChange={e => setH("TotalBlocks", +e.target.value)} />
        </FormField>
        <div style={{ display:"flex", gap:10 }}>
          <Btn style={{ flex:1, padding:"10px 0" }} onClick={saveHostel} disabled={saving}>
            {saving ? "Adding…" : "Add Hostel"}
          </Btn>
          <Btn variant="ghost" style={{ flex:1, padding:"10px 0" }} onClick={() => setModal(null)}>Cancel</Btn>
        </div>
      </Modal>

      {/* Add Room Modal */}
      <Modal open={modal === "room"} onClose={() => setModal(null)} title={`Add Room — ${selH?.HostelName}`} width={420}>
        {error   && <Alert type="error"   msg={error}   />}
        {success && <Alert type="success" msg={success} />}
        <FormField label="Block ID (number)">
          <input style={inputStyle} placeholder="e.g. 1" type="number"
            value={rForm.BlockID} onChange={e => setR("BlockID", e.target.value)} />
        </FormField>
        <FormField label="Room No">
          <input style={inputStyle} placeholder="e.g. 301"
            value={rForm.RoomNo} onChange={e => setR("RoomNo", e.target.value)} />
        </FormField>
        <FormField label="Capacity">
          <input style={inputStyle} type="number" min={1} max={3} value={rForm.Capacity}
            onChange={e => setR("Capacity", +e.target.value)} />
        </FormField>
        <FormField label="Room Type">
          <select style={inputStyle} value={rForm.RoomType} onChange={e => setR("RoomType", e.target.value)}>
            {["Single","Double","Triple"].map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <div style={{ display:"flex", gap:10 }}>
          <Btn style={{ flex:1, padding:"10px 0" }} onClick={saveRoom} disabled={saving}>
            {saving ? "Adding…" : "Add Room"}
          </Btn>
          <Btn variant="ghost" style={{ flex:1, padding:"10px 0" }} onClick={() => setModal(null)}>Cancel</Btn>
        </div>
      </Modal>
    </PageLayout>
  );
}
