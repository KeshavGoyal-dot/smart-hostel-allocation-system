// src/pages/StudentDashboardPage.js — Student portal

import React, { useState, useEffect } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Alert, Badge, Btn, Card } from "../components/UI";
import { getStudent, getStudentAllocations, applyForHostel } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks";

// Priority score formula (mirrors MySQL fn_priority_score)
function priorityScore(year, category) {
  let score = (year || 0) * 10;
  if (category === "SC" || category === "ST") score += 15;
  else if (category === "EWS") score += 12;
  else if (category === "OBC") score += 10;
  return score;
}

export default function StudentDashboardPage() {
  const { user }                              = useAuth();
  const [profile,  setProfile]               = useState(null);
  const [history,  setHistory]               = useState([]);
  const [loading,  setLoading]               = useState(true);
  const { run, loading: applying, error: applyError, success: applySuccess } = useAsync();

  useEffect(() => {
    const id = user.id;
    if (!id) { setLoading(false); return; }
    Promise.all([
      getStudent(id),
      getStudentAllocations(id),
    ])
      .then(([p, h]) => {
        setProfile(p.data.data || p.data);
        setHistory(h.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const apply = async () => {
    try { await run(() => applyForHostel()); }
    catch {}
  };

  if (loading) return <PageLayout title="My Dashboard"><Spinner /></PageLayout>;

  const isAllocated = profile?.AllocStatus === "Active";
  const score       = profile ? priorityScore(profile.Year, profile.Category) : 0;

  return (
    <PageLayout title="My Dashboard">
      {/* ── Profile card ───────────────────────────────────── */}
      {profile && (
        <Card>
          <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
            {/* Avatar */}
            <div style={{
              width:62, height:62, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#1D9E75,#378ADD)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700, fontSize:24,
            }}>
              {profile.Name?.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              <h2 style={{ margin:"0 0 4px", fontSize:20, color:"#1A2332" }}>{profile.Name}</h2>
              <div style={{ color:"#7A8499", fontSize:13, marginBottom:12 }}>
                {profile.StudentID} · {profile.Branch} · Year {profile.Year}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Badge status={profile.Gender}   />
                <Badge status={profile.Category} />
                <Badge status={isAllocated ? "Active" : "Unallocated"} />
              </div>
            </div>

            {/* Contact */}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px" }}>Email</div>
              <div style={{ fontWeight:500, fontSize:13, color:"#1A2332" }}>{profile.Email}</div>
              {profile.Phone && (
                <div style={{ fontSize:12, color:"#7A8499", marginTop:4 }}>{profile.Phone}</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Priority score ──────────────────────────────────── */}
      {profile && (
        <Card title="My Waitlist Priority Score">
          <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
            <div style={{
              fontSize:52, fontWeight:700, color:"#1D9E75",
              background:"#E1F5EE", borderRadius:12,
              padding:"12px 24px", lineHeight:1,
            }}>
              {score}
            </div>
            <div style={{ fontSize:13, color:"#7A8499", lineHeight:1.9 }}>
              <div>Year {profile.Year} × 10 = <strong style={{ color:"#1A2332" }}>{profile.Year * 10}</strong></div>
              <div>Category ({profile.Category}) bonus = <strong style={{ color:"#1A2332" }}>
                {profile.Category === "SC" || profile.Category === "ST" ? 15
                  : profile.Category === "EWS" ? 12
                  : profile.Category === "OBC" ? 10 : 0}
              </strong></div>
              <div style={{ fontSize:11, color:"#9AA5B4", marginTop:4 }}>
                Higher score = allocated sooner when a room becomes available
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Current allocation ──────────────────────────────── */}
      <Card title="Current Room Status">
        {isAllocated ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
            {[
              ["Hostel",    profile?.HostelName],
              ["Block",     profile?.BlockName],
              ["Room No",   profile?.RoomNo],
              ["Allocated", profile?.AllocDate?.split("T")[0]],
            ].map(([l, v]) => (
              <div key={l} style={{ background:"#F8FDF9", borderRadius:8, padding:"12px 16px", border:"1px solid #C8EDD9" }}>
                <div style={{ fontSize:10, color:"#7A8499", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:4 }}>{l}</div>
                <div style={{ fontWeight:600, color:"#1A2332", fontSize:15 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{
              background:"#FCEBEB", color:"#A32D2D",
              padding:"11px 16px", borderRadius:8, fontSize:13, marginBottom:16,
            }}>
              You don't have an active room allocation yet.
            </div>

            {applyError   && <Alert type="error"   msg={applyError}   />}
            {applySuccess && <Alert type="success" msg={applySuccess} />}

            {!applySuccess && (
              <>
                <Btn onClick={apply} disabled={applying}>
                  {applying ? "Applying…" : "✉ Apply for Hostel Room"}
                </Btn>
                <p style={{ fontSize:12, color:"#7A8499", marginTop:10, lineHeight:1.7 }}>
                  Clicking <em>Apply</em> adds you to the priority waitlist with a score of <strong>{score}</strong>.
                  You will be automatically allocated a room when one becomes available.
                </p>
              </>
            )}
          </div>
        )}
      </Card>

      {/* ── Allocation history ──────────────────────────────── */}
      <Card title="Allocation History">
        {history.length === 0 ? (
          <div style={{ color:"#7A8499", fontSize:13, padding:"8px 0" }}>
            No allocation history found.
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>
                {["Alloc ID","Hostel","Block","Room","Type","Date","Status"].map(h => (
                  <th key={h} style={{
                    textAlign:"left", padding:"8px 10px",
                    borderBottom:"2px solid #E8EBF0",
                    fontSize:10, fontWeight:700, color:"#7A8499", textTransform:"uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(a => (
                <tr key={a.AllocID}
                  onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background=""}>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", color:"#7F77DD", fontWeight:600 }}>#{a.AllocID}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontSize:12 }}>{a.HostelName}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5" }}>{a.BlockName}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontWeight:700 }}>{a.RoomNo}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5" }}>{a.RoomType}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontSize:12, color:"#7A8499" }}>{a.AllocDate?.split("T")[0]}</td>
                  <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5" }}><Badge status={a.Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageLayout>
  );
}
