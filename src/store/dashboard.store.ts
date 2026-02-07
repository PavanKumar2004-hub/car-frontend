import axios from "axios";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

/* ===============================
   API CONFIG
================================ */
const API_BASE = "https://car-backend-onkl.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===============================
   TYPES
================================ */

export type OwnerInfo = {
  _id: string;
  name: string;
  phone: string;
  email: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "USER"; // GLOBAL ROLE ONLY
};

export type ContextRole = "OWNER" | "FAMILY" | "FRIEND";

export type SensorStatus = {
  alcohol: "SAFE" | "DANGER";
  obstacle: "SAFE" | "WARNING" | "DANGER";
  surface: "SAFE" | "WARNING";
  accident: "SAFE" | "ACCIDENT";
  vehicle: "RUNNING" | "STOPPED";
};

export type VehicleState = {
  speedAllowed: number;
  lockState: "LOCKED" | "LIMITED" | "UNLOCKED";
  reason: string;
};

/* 🔥 NEW: vehicle device model */
export type VehicleDevice = {
  _id: string;
  vehicleId: string;
  name: string;
  plateNumber: string; // 🔥 NEW
  createdAt?: string;
};

/* credentials only (create/rotate response) */
export type VehicleCredentials = {
  vehicleId: string;
  espKey: string;
};

export type MemberUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

export type Member = {
  _id: string;
  userId: MemberUser;
  relation: string;
  role: "FAMILY" | "FRIEND";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/* 🔹 NEW: Per-member approval (matches backend response) */
export type RequestApproval = {
  memberId: string;
  userId: string; // ✅ ADD THIS
  name: string;
  relation: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  decidedAt: string | null;
};

export type AddMemberPayload = {
  phone: string;
  relation: string;
  role: "FAMILY" | "FRIEND";
};

export type UpdateMemberPayload = {
  relation?: string;
  role?: "FAMILY" | "FRIEND";
  status?: "ACTIVE" | "INACTIVE";
};

/* ===============================
   STORE STATE
================================ */
type DashboardState = {
  /* Auth */
  token: string | null;
  user: User | null;
  owner: OwnerInfo | null;

  contextRole: ContextRole | null;
  dashboardOwnerId: string | null;

  uiOverrideSensors: any | null;
  setUiOverride: (data: any) => void;
  clearUiOverride: () => void;

  /* Sensors */
  sensors: any;
  sensorStatus: SensorStatus | null;
  sensorsByVehicleId: Record<string, any>;

  /* Vehicle */
  vehicle: VehicleState | null;
  vehicles: VehicleDevice[];
  activeVehicle: VehicleDevice | null;

  /* Members */
  members: Member[];

  /* Requests */
  activeRequestId: string | null;
  requestStatus: RequestStatus | null;
  requestCreatedAt: string | null;
  requestExpiresAt: string | null;
  fetchActiveRequest: () => Promise<void>;

  /* 🔥 ADD THESE TWO */
  requestApprovals: RequestApproval[];
  requestAlcoholLevel: number | null;

  /* Socket */
  socket: Socket | null;

  /* ===============================
     ACTIONS
  ================================ */
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getVehicleCredentials: (id: string) => Promise<VehicleCredentials>;

  fetchVehicles: () => Promise<void>;
  addVehicle: (name: string, plateNumber: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  rotateVehicleKey: (id: string) => Promise<VehicleCredentials>;

  setActiveVehicle: (v: VehicleDevice) => Promise<void>;

  loadUser: () => Promise<void>;
  loadContextRole: () => Promise<void>;

  connectSocket: () => void;

  fetchMembers: () => Promise<void>;
  addMember: (data: AddMemberPayload) => Promise<void>;
  updateMember: (id: string, data: UpdateMemberPayload) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  askStartRequest: (alcoholLevel: number) => Promise<void>;
  fetchRequestApprovals: (requestId: string) => Promise<void>;

  updateSensors: (payload: any) => Promise<void>;
  evaluateVehicle: () => Promise<void>;
};

/* ===============================
   STORE IMPLEMENTATION
================================ */
export const useDashboardStore = create<DashboardState>((set, get) => ({
  /* -------- AUTH STATE -------- */
  token: localStorage.getItem("token"),
  user: null,
  owner: null,

  contextRole: null,
  dashboardOwnerId: null,

  vehicles: [],
  activeVehicle: null,

  uiOverrideSensors: null,
  setUiOverride: (data) => set({ uiOverrideSensors: data }),
  clearUiOverride: () => set({ uiOverrideSensors: null }),

  /* -------- DATA -------- */
  sensors: null,
  sensorStatus: null,
  sensorsByVehicleId: {},
  vehicle: null,
  members: [],
  activeRequestId: null,
  requestCreatedAt: null,

  requestStatus: null,
  requestAlcoholLevel: null,
  requestExpiresAt: null,

  /* 🔹 NEW */
  requestApprovals: [],

  socket: null,

  /* -------- AUTH ACTIONS -------- */
  register: async (data) => {
    await api.post("/auth/register", data);
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);

    set({
      token: res.data.token,
      user: res.data.user,
    });

    // await get().fetchVehicles(); // 🔥 ADD THIS
    await get().loadContextRole();
  },

  loadUser: async () => {
    if (!get().token) return;
    const res = await api.get("/auth/me");
    set({ user: res.data });
  },

  loadContextRole: async () => {
    const res = await api.get("/auth/context");

    const nextActive = res.data.activeVehicle || null;
    const nextSensors =
      nextActive?.vehicleId != null
        ? (get().sensorsByVehicleId[nextActive.vehicleId] ?? get().sensors)
        : get().sensors;

    set({
      contextRole: res.data.contextRole,
      dashboardOwnerId: res.data.dashboardOwnerId,
      owner: res.data.owner,
      vehicles: res.data.vehicles || [],
      activeVehicle: nextActive,
      sensors: nextSensors,
    });
  },

  getVehicleCredentials: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    get().socket?.disconnect();

    set({
      token: null,
      user: null,
      contextRole: null,
      dashboardOwnerId: null,
      socket: null,
      sensors: null,
      sensorStatus: null,
      sensorsByVehicleId: {},
      vehicle: null,
      members: [],
      activeRequestId: null,
      requestStatus: null,
      requestCreatedAt: null,
      requestExpiresAt: null,
      requestApprovals: [],
      vehicles: [],
      activeVehicle: null,
    });
  },

  /* -------- SOCKET -------- */
  connectSocket: () => {
    if (get().socket || !get().token) return;

    const socket = io("https://car-backend-onkl.onrender.com", {
      transports: ["websocket"],
      auth: { token: get().token },
    });

    socket.on("sensor:update", (data) => {
      const vehicleId = data?.vehicleId;

      if (!vehicleId) {
        set({ sensors: data, sensorStatus: data.status });
        return;
      }

      set((state) => {
        const sensorsByVehicleId = {
          ...state.sensorsByVehicleId,
          [vehicleId]: data,
        };

        const isActive =
          !state.activeVehicle || state.activeVehicle.vehicleId === vehicleId;

        return {
          sensorsByVehicleId,
          sensors: isActive ? data : state.sensors,
          sensorStatus: isActive ? data.status : state.sensorStatus,
        };
      });
    });

    socket.on("request:new", async ({ requestId, requestedAt, expiresAt }) => {
      set({
        activeRequestId: requestId,
        requestStatus: "PENDING",
        requestCreatedAt: requestedAt ?? null,
        requestExpiresAt: expiresAt ?? null,
      });
      await get().fetchRequestApprovals(requestId);
    });

    socket.on("request:update", ({ status }) => {
      set({ requestStatus: status });
    });

    socket.on("vehicle:update", (vehicle) => {
      set({ vehicle });
    });

    socket.on("activeVehicle:update", ({ ownerId, activeVehicle }) => {
      const currentOwnerId = get().dashboardOwnerId;
      if (currentOwnerId && currentOwnerId !== ownerId) return;

      set((state) => {
        const nextActive = activeVehicle ?? null;
        const nextSensors =
          nextActive?.vehicleId != null
            ? (state.sensorsByVehicleId[nextActive.vehicleId] ?? state.sensors)
            : null;

        return {
          activeVehicle: nextActive,
          sensors: nextSensors,
          vehicles:
            state.contextRole === "OWNER"
              ? state.vehicles
              : nextActive
                ? [nextActive]
                : [],
        };
      });
    });

    socket.on("request:approval:update", async ({ requestId }) => {
      if (get().activeRequestId === requestId) {
        await get().fetchRequestApprovals(requestId);
      }
    });

    set({ socket });
  },

  fetchActiveRequest: async () => {
    const clear = () =>
      set({
        activeRequestId: null,
        requestStatus: null,
        requestApprovals: [],
        requestAlcoholLevel: null,
        requestCreatedAt: null,
        requestExpiresAt: null,
      });

    try {
      const res = await api.get("/requests/active");

      if (!res.data) {
        clear();
        return;
      }

      const requestId = res.data.requestId;

      set({
        activeRequestId: requestId,
        requestStatus: res.data.status ?? "PENDING",
      });

      await get().fetchRequestApprovals(requestId);
    } catch {
      clear();
    }
  },

  /* -------- MEMBERS -------- */
  fetchMembers: async () => {
    const res = await api.get<Member[]>("/members");
    set({ members: res.data });
  },

  addMember: async (data) => {
    await api.post("/members", data);
    await get().fetchMembers();
  },

  updateMember: async (id, data) => {
    await api.put(`/members/${id}`, data);
    await get().fetchMembers();
  },

  deleteMember: async (id) => {
    await api.delete(`/members/${id}`);
    await get().fetchMembers();
  },

  /* -------- REQUEST -------- */
  askStartRequest: async (alcoholLevel) => {
    const res = await api.post("/requests/ask", { alcoholLevel });

    set({
      activeRequestId: res.data.requestId,
      requestStatus: "PENDING",
      requestCreatedAt: res.data.requestedAt ?? null,
      requestExpiresAt: res.data.expiresAt ?? null,
    });

    await get().fetchRequestApprovals(res.data.requestId);
  },

  fetchRequestApprovals: async (requestId) => {
    try {
      const res = await api.get(`/requests/${requestId}/approvals`);

      set({
        requestApprovals: res.data.approvals,
        requestAlcoholLevel: res.data.alcoholLevel,
        requestCreatedAt: res.data.requestedAt,
        requestExpiresAt: res.data.expiresAt ?? null,
        requestStatus: res.data.status ?? get().requestStatus,
      });
    } catch {
      set({
        activeRequestId: null,
        requestStatus: null,
        requestApprovals: [],
        requestAlcoholLevel: null,
        requestCreatedAt: null,
        requestExpiresAt: null,
      });
    }
  },

  /* -------- SENSORS -------- */
  updateSensors: async (payload) => {
    await api.post("/sensors/update", payload);
  },

  /* -------- VEHICLE -------- */
  evaluateVehicle: async () => {
    const res = await api.post("/vehicle/evaluate");
    set({ vehicle: res.data });
  },

  fetchVehicles: async () => {
    await get().loadContextRole();
  },
  addVehicle: async (name, plateNumber) => {
    await api.post("/vehicles", { name, plateNumber });
    await get().fetchVehicles();
  },

  deleteVehicle: async (id) => {
    await api.delete(`/vehicles/${id}`);
    await get().fetchVehicles();
  },

  rotateVehicleKey: async (id): Promise<VehicleCredentials> => {
    const res = await api.put(`/vehicles/${id}/rotate-key`);
    return res.data;
  },

  setActiveVehicle: async (v) => {
    const res = await api.put(`/vehicles/${v._id}/active`);
    const active = res.data.activeVehicle ?? v;

    set((state) => ({
      activeVehicle: active,
      sensors:
        active?.vehicleId != null
          ? (state.sensorsByVehicleId[active.vehicleId] ?? state.sensors)
          : null,
    }));
  },
}));
