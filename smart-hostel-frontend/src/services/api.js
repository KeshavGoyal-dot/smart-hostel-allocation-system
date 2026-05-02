// src/services/api.js  — Central Axios instance + all API helpers

import axios from "axios";

const instance = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach JWT to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("hostel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
instance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = "/"; }
    return Promise.reject(err.response?.data || err);
  }
);

/* AUTH */
export const loginStaff   = (u, p)  => instance.post("/auth/login",         { username: u, password: p });
export const loginStudent = (e, p)  => instance.post("/auth/student-login",  { email: e,    password: p });

/* STUDENTS */
export const getStudents    = ()       => instance.get("/students");
export const getStudent     = (id)     => instance.get(`/students/${id}`);
export const createStudent  = (data)   => instance.post("/students", data);
export const updateStudent  = (id, d)  => instance.put(`/students/${id}`, d);
export const deleteStudent  = (id)     => instance.delete(`/students/${id}`);

/* HOSTELS */
export const getHostels     = ()            => instance.get("/hostels");
export const getHostelRooms = (hid)         => instance.get(`/hostels/${hid}/rooms`);
export const createHostel   = (data)        => instance.post("/hostels", data);
export const addRoom        = (hid,bid,d)   => instance.post(`/hostels/${hid}/blocks/${bid}/rooms`, d);

/* ALLOCATIONS */
export const getAllocations        = ()    => instance.get("/allocations");
export const allocateRoom         = (sid) => instance.post("/allocations/allocate", { studentID: sid });
export const vacateRoom           = (sid) => instance.post("/allocations/vacate",   { studentID: sid });
export const applyForHostel       = ()    => instance.post("/allocations/apply",    {});
export const getStudentAllocations= (sid) => instance.get(`/allocations/student/${sid}`);

/* WAITLIST */
export const getWaitlist          = ()    => instance.get("/waitlist");
export const removeFromWaitlist   = (sid) => instance.delete(`/waitlist/${sid}`);

/* REPORTS */
export const getOccupancyReport   = () => instance.get("/reports/occupancy");
export const getBranchReport      = () => instance.get("/reports/by-branch");
export const getUnallocatedReport = () => instance.get("/reports/unallocated");
export const getAuditLog          = () => instance.get("/reports/audit-log");
export const getPaymentReport     = () => instance.get("/reports/payments");

export default instance;
