// src/pages/DashboardPage.js  — Admin/Warden overview

import React, { useEffect, useState } from "react";
import { PageLayout } from "../components/Layout";
import { StatCard, Card, Spinner, ProgressBar, Badge } from "../components/UI";
import { getStudents, getAllocations, getWaitlist, getHostels } from "../services/api";

export default function DashboardPage() {
  const [students,  setStudents]  = useState([]);
  const [allocs,    setAllocs]    = useState([]);
  const [waitlist,  setWaitlist]  = useState([]);
  const [hostels,   setHostels]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getAllocations(), getWaitlist(), getHostels()])
      .then(([s, a, w, h]) => {
        setStudents(s.data?.data  || []);
        setAllocs(a.data?.data    || []);
        setWaitlist(w.data?.data  || []);
        setHostels(h.data?.data   || []);
      })
      .catch(() => {}) // Keep empty arrays on error
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout title="Dashboard"><Spinner /></PageLayout>;

  const total     = students.length;
  const allocated = allocs.length;
  const rate      = total > 0 ? Math.round((allocated / total) * 100) : 0;

  const statCards = [
    { icon:"👤", label:"Total Students",     value: total,                              color:"#378ADD" },
    { icon:"🏠", label:"Active Allocations", value: allocated,                          color:"#1D9E75" },
    { icon:"⏳", label:"On Waitlist",         value: waitlist.length,                    color:"#BA7517" },
    { icon:"🏨", label:"Hostels",            value: hostels.length,                     color:"#7F77DD" },
    { icon:"❗", label:"Unallocated",         value: Math.max(0, total - allocated),     color:"#E24B4A" },
    { icon:"📈", label:"Allocation Rate",    value: total > 0 ? rate + "%" : "—",       color:"#D85A30" },
  ];

  return (
    <PageLayout title="Dashboard">
      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Rate + Occupancy */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
        <Card title="Allocation Rate">
          <div style={{ fontSize:34, fontWeight:700, color:"#1A2332", marginBottom:10 }}>
            {total > 0 ? rate + "%" : "—"}
          </div>
          <ProgressBar pct={rate} color="#1D9E75" />
          <div style={{ fontSize:12, color:"#7A8499", marginTop:8 }}>
            {allocated} of {total} students have a room
          </div>
        </Card>

        <Card title="Hostel Occupancy">
          {hostels.length === 0
            ? <div style={{ color:"#7A8499", fontSize:13 }}>No hostel data</div>
            : hostels.map(h => {
              const p = h.TotalCapacity > 0
                ? Math.round((h.TotalOccupied / h.TotalCapacity) * 100)
                : 0;
              return (
                <div key={h.HostelID} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#4A5568", marginBottom:3 }}>
                    <span>{h.HostelName}</span>
                    <span style={{ color:"#7A8499" }}>{h.TotalOccupied || 0}/{h.TotalCapacity || 0}</span>
                  </div>
                  <ProgressBar pct={p} />
                </div>
              );
            })
          }
        </Card>
      </div>

      {/* Recent allocations */}
      <Card title="Recent Allocations">
        {allocs.length === 0
          ? <div style={{ color:"#7A8499", fontSize:13 }}>No allocations yet</div>
          : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  {["Student","Branch","Hostel","Room","Date","Status"].map(h => (
                    <th key={h} style={{
                      textAlign:"left", padding:"8px 10px",
                      borderBottom:"2px solid #E8EBF0",
                      fontSize:10, fontWeight:700, color:"#7A8499", textTransform:"uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocs.slice(0, 6).map(a => (
                  <tr key={a.AllocID}
                    onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background=""}>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontWeight:500 }}>{a.Name}</td>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", color:"#7A8499" }}>{a.Branch}</td>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontSize:12 }}>{a.HostelName}</td>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontWeight:700 }}>{a.RoomNo}</td>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5", fontSize:12, color:"#7A8499" }}>
                      {a.AllocDate?.split("T")[0]}
                    </td>
                    <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5" }}>
                      <Badge status={a.Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>
    </PageLayout>
  );
}
