// src/pages/ReportsPage.js

import React, { useState, useEffect } from "react";
import { PageLayout } from "../components/Layout";
import { Spinner, Badge, Card, DataTable, ProgressBar } from "../components/UI";
import {
  getOccupancyReport, getBranchReport,
  getUnallocatedReport, getAuditLog, getPaymentReport,
} from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const TABS = [
  { id:"occupancy",   label:"📊 Occupancy"   },
  { id:"branch",      label:"🎓 By Branch"   },
  { id:"unallocated", label:"❗ Unallocated"  },
  { id:"audit",       label:"📋 Audit Log"   },
  { id:"payments",    label:"💳 Payments"    },
];
const PIE_COLORS = ["#1D9E75", "#E24B4A", "#BA7517"];

export default function ReportsPage() {
  const [tab,      setTab]    = useState("occupancy");
  const [occupancy,  setOcc]  = useState([]);
  const [branch,     setBrn]  = useState([]);
  const [unalloc,    setUna]  = useState([]);
  const [audit,      setAud]  = useState([]);
  const [payments,   setPay]  = useState([]);
  const [loading,    setLoad] = useState(true);

  useEffect(() => {
    setLoad(true);
    Promise.all([
      getOccupancyReport().catch(()  => ({ data:{ data:[] } })),
      getBranchReport().catch(()     => ({ data:{ data:[] } })),
      getUnallocatedReport().catch(()=> ({ data:{ data:[] } })),
      getAuditLog().catch(()         => ({ data:{ data:[] } })),
      getPaymentReport().catch(()    => ({ data:{ data:[] } })),
    ]).then(([o, b, u, a, p]) => {
      setOcc(o.data?.data || []);
      setBrn(b.data?.data || []);
      setUna(u.data?.data || []);
      setAud(a.data?.data || []);
      setPay(p.data?.data || []);
    }).finally(() => setLoad(false));
  }, []);

  return (
    <PageLayout title="Reports & Analytics">

      {/* Tab bar */}
      <div style={{
        display:"flex", gap:0, marginBottom:22,
        background:"#fff", borderRadius:10,
        border:"1px solid #E8EBF0", overflow:"hidden", width:"fit-content",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"9px 18px", border:"none", cursor:"pointer",
            fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
            background: tab === t.id ? "#1D9E75" : "transparent",
            color:       tab === t.id ? "#fff"    : "#4A5568",
            transition:"background 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>

          {/* ── OCCUPANCY ─────────────────────────────────── */}
          {tab === "occupancy" && (
            <>
              <Card title="Hostel-wise Occupancy">
                {occupancy.length === 0
                  ? <div style={{ color:"#7A8499", fontSize:13 }}>No occupancy data available</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={occupancy} margin={{ top:0, right:20, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                        <XAxis dataKey="HostelName" tick={{ fontSize:11 }} />
                        <YAxis tick={{ fontSize:11 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="OccupiedSeats" fill="#1D9E75"  name="Occupied" radius={[4,4,0,0]} />
                        <Bar dataKey="FreeSeats"     fill="#A8DFD0"  name="Free"     radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>

              <Card title="Breakdown by Hostel">
                {occupancy.map(h => (
                  <div key={h.HostelName} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div>
                        <span style={{ fontWeight:600, fontSize:13, color:"#1A2332" }}>{h.HostelName}</span>
                        <span style={{ fontSize:11, color:"#7A8499", marginLeft:8 }}>{h.Type}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#7A8499" }}>
                        {h.OccupiedSeats}/{h.TotalSeats} seats
                      </div>
                    </div>
                    <ProgressBar pct={h.OccupancyPercent || 0} />
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* ── BY BRANCH ─────────────────────────────────── */}
          {tab === "branch" && (
            <>
              <Card title="Allocations by Branch & Year">
                {branch.length === 0
                  ? <div style={{ color:"#7A8499", fontSize:13 }}>No branch data available</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={branch} margin={{ top:0, right:20, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                        <XAxis dataKey="Branch" tick={{ fontSize:11 }} />
                        <YAxis tick={{ fontSize:11 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="AllocatedCount" fill="#378ADD" name="Allocated Students" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>

              <Card>
                <DataTable
                  columns={[
                    { label:"Branch", key:"Branch" },
                    { label:"Year",   render: r => `Year ${r.Year}` },
                    { label:"Allocated Students", key:"AllocatedCount" },
                  ]}
                  rows={branch}
                  emptyMsg="No branch data"
                />
              </Card>
            </>
          )}

          {/* ── UNALLOCATED ───────────────────────────────── */}
          {tab === "unallocated" && (
            <Card title={`Unallocated Students (${unalloc.length})`}>
              <DataTable
                columns={[
                  { label:"Student ID", key:"StudentID", style:{ fontWeight:600, color:"#E24B4A" } },
                  { label:"Name",       render: s => <span style={{ fontWeight:500 }}>{s.Name}</span> },
                  { label:"Branch",     key:"Branch" },
                  { label:"Year",       key:"Year"   },
                  { label:"Gender",     render: s => <Badge status={s.Gender}   /> },
                  { label:"Category",   render: s => <Badge status={s.Category} /> },
                  { label:"Email",      key:"Email", style:{ fontSize:12, color:"#7A8499" } },
                ]}
                rows={unalloc}
                emptyMsg="🎉 All students are allocated!"
              />
            </Card>
          )}

          {/* ── AUDIT LOG ─────────────────────────────────── */}
          {tab === "audit" && (
            <Card title="Allocation Audit Log (Latest 100)">
              <DataTable
                columns={[
                  { label:"Log ID",  render: l => <span style={{ color:"#7A8499" }}>#{l.LogID}</span> },
                  { label:"Action",  render: l => <Badge status={l.Action === "ALLOCATED" ? "Active" : l.Action} /> },
                  { label:"Student", render: l => (
                    <div>
                      <div style={{ fontWeight:500 }}>{l.StudentName || "—"}</div>
                      <div style={{ fontSize:11, color:"#7A8499" }}>{l.StudentID}</div>
                    </div>
                  )},
                  { label:"Alloc ID",  key:"AllocID" },
                  { label:"Room ID",   key:"RoomID"  },
                  { label:"Time",      render: l => (
                    <span style={{ fontSize:11 }}>{l.ActionTime?.replace("T"," ").slice(0,19)}</span>
                  )},
                  { label:"Performed By", key:"PerformedBy" },
                ]}
                rows={audit}
                emptyMsg="No audit records found"
              />
            </Card>
          )}

          {/* ── PAYMENTS ──────────────────────────────────── */}
          {tab === "payments" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
                <Card title="Payment Status Distribution">
                  {payments.length === 0
                    ? <div style={{ color:"#7A8499", fontSize:13 }}>No payment data</div>
                    : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={payments} dataKey="Count" nameKey="Status"
                            cx="50%" cy="50%" outerRadius={80}
                            label={({ Status, Count }) => `${Status}: ${Count}`}
                          >
                            {payments.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )
                  }
                </Card>

                <Card title="Payment Summary">
                  {payments.map(p => (
                    <div key={p.Status} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"11px 0", borderBottom:"1px solid #F0F2F5",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Badge status={p.Status} />
                        <span style={{ fontSize:13, color:"#4A5568" }}>{p.Count} payments</span>
                      </div>
                      <span style={{ fontWeight:700, color:"#1A2332" }}>
                        ₹{Number(p.TotalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div style={{ color:"#7A8499", fontSize:13 }}>No payment data</div>
                  )}
                </Card>
              </div>

              <Card>
                <DataTable
                  columns={[
                    { label:"Status",       render: p => <Badge status={p.Status} /> },
                    { label:"Count",        key:"Count" },
                    { label:"Total Amount", render: p => `₹${Number(p.TotalAmount||0).toLocaleString("en-IN")}` },
                  ]}
                  rows={payments}
                  emptyMsg="No payment records"
                />
              </Card>
            </>
          )}

        </>
      )}
    </PageLayout>
  );
}
