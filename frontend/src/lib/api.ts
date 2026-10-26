/**
 * CineConnect API Client
 * Connects to the FastAPI backend with token management and auth headers.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  auth_provider: string;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  profile?: {
    name?: string;
    bio?: string;
    photo_url?: string;
    primary_craft?: string;
    secondary_crafts?: string[];
    city?: string;
    state?: string;
    travel_radius_km?: number;
    completeness_score?: number;
    languages?: Array<{ lang: string; fluency: string }>;
    availability?: { status?: string; note?: string };
  };
  skills: Array<{
    skill_id: number;
    skill_name: string;
    category?: string;
    proficiency: string;
  }>;
  experiences: Array<{
    id: string;
    title: string;
    company?: string;
    role_type?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  portfolio: Array<{
    id: string;
    type: "photo" | "video" | "showreel" | "audio" | "document" | "resume";
    s3_url: string;
    title?: string;
    description?: string;
    is_public: boolean;
    sort_order: number;
  }>;
}

export interface CompletenessData {
  score: number;
  max_score: number;
  suggestions: string[];
}

export class ApiClient {
  private static tokenKey = "cineconnect_access_token";
  private static userKey = "cineconnect_user";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  static setAuth(token: string, user: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  static clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  static getCachedUser(): any | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        // ignore fallback
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  static async registerTalent(data: { email: string; password: string; phone: string; name: string; craft?: string; location?: string }) {
    const res = await this.request<any>("/auth/register/talent", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user);
    return res;
  }

  static async registerProduction(data: { company_name: string; email: string; phone: string; password: string; location?: string; description?: string }) {
    const res = await this.request<any>("/auth/register/production", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user);
    return res;
  }

  static async register(data: { email: string; password: string; name: string; phone?: string; account_type?: string }) {
    const res = await this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user);
    return res;
  }

  static async login(data: { email: string; password: string }) {
    const res = await this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user);
    return res;
  }

  // Profile
  static async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>("/users/me");
  }

  static async updateProfile(data: any): Promise<any> {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async getCompleteness(): Promise<CompletenessData> {
    return this.request<CompletenessData>("/users/me/completeness");
  }

  static async getSkillsCatalog() {
    return this.request<Array<{ id: number; name: string; category?: string }>>("/users/skills/catalog");
  }

  static async updateSkills(skills: Array<{ skill_id: number; proficiency: string }>) {
    return this.request("/users/me/skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    });
  }

  // Experience
  static async addExperience(data: any) {
    return this.request("/users/me/experience", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deleteExperience(id: string) {
    return this.request(`/users/me/experience/${id}`, {
      method: "DELETE",
    });
  }

  // Portfolio
  static async addPortfolioItem(data: any) {
    return this.request("/users/me/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deletePortfolioItem(id: string) {
    return this.request(`/users/me/portfolio/${id}`, {
      method: "DELETE",
    });
  }

  // Media
  static async getUploadUrl(filename: string, content_type: string, purpose: string = "portfolio") {
    return this.request<{ upload_url: string; file_key: string; cdn_url: string }>("/media/upload-url", {
      method: "POST",
      body: JSON.stringify({ filename, content_type, purpose }),
    });
  }

  // Notifications API
  static async getNotifications(filter: "all" | "unread" = "all", page: number = 1, perPage: number = 20) {
    return this.request<NotificationListResponse>(`/notifications?filter_by=${filter}&page=${page}&per_page=${perPage}`);
  }

  static async markNotificationRead(id: string) {
    return this.request<{ id: string; is_read: boolean; unread_count: number }>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  static async markAllNotificationsRead() {
    return this.request<{ success: boolean; marked_count: number; unread_count: number }>("/notifications/mark-all-read", {
      method: "POST",
    });
  }

  static async registerDeviceToken(fcmToken: string, deviceType: "android" | "ios" | "web" = "web") {
    return this.request<{ success: boolean; device_type: string; is_active: boolean }>("/notifications/device-token", {
      method: "POST",
      body: JSON.stringify({ fcm_token: fcmToken, device_type: deviceType }),
    });
  }

  static async getNotificationPreferences() {
    return this.request<NotificationPreferences>("/notifications/preferences");
  }

  static async updateNotificationPreferences(prefs: NotificationPreferences) {
    return this.request<NotificationPreferences>("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    });
  }

  static async triggerStatusUpdate(data: {
    target_user_id: string;
    project_title: string;
    role_name: string;
    production_house: string;
    status: "Selected" | "Under Review" | "Not Selected";
    instructions?: string;
  }) {
    return this.request<NotificationItem>("/notifications/trigger-status-update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  // Settings & Account Management API
  static async getMySettings() {
    return this.request<UserSettingsData>("/settings/me");
  }

  static async updateMySettings(data: Partial<UserSettingsData>) {
    return this.request<UserSettingsData>("/settings/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async getActiveSessions() {
    return this.request<ActiveSessionsResponse>("/settings/sessions");
  }

  static async revokeActiveSession(sessionId: string) {
    return this.request<{ status: string; revoked_session_id: string }>(`/settings/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  static async revokeAllOtherSessions() {
    return this.request<{ status: string; message: string; revoked_count: number }>("/settings/sessions/revoke-all-others", {
      method: "POST",
    });
  }

  static async changePassword(data: { current_password: string; new_password: string; confirm_password: string }) {
    return this.request<{ status: string; message: string }>("/settings/security/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async toggle2FA(enabled: boolean) {
    return this.request<Toggle2FAResponseData>("/settings/security/toggle-2fa", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });
  }

  static async exportUserData() {
    return this.request<DataExportData>("/settings/export-data", {
      method: "POST",
    });
  }

  static async deactivateOrDeleteAccount(data: { action: "DEACTIVATE" | "DELETE"; reason?: string; confirmation_text: string }) {
    return this.request<{ status: string; action: string; message: string }>("/settings/account", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }
}

export interface NotificationItem {
  id: string;
  user_id: string;
  sender_id?: string | null;
  title: string;
  body: string;
  notification_type: "APPLICATION_STATUS" | "INTERVIEW_SCHEDULE" | "DIRECT_MESSAGE" | "CASTING_ALERT" | "SYSTEM";
  deep_link_route?: string | null;
  metadata_json: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unread_count: number;
  page: number;
  per_page: number;
}

export interface NotificationPreferences {
  application_status: boolean;
  interview_schedule: boolean;
  direct_message: boolean;
  casting_alert: boolean;
  system: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
}

export type AccountType = "CREATIVE_TALENT" | "PRODUCTION_HOUSE";
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";
export type StreamQuality = "AUTO" | "LOW" | "MEDIUM" | "HIGH";
export type ThemeMode = "DARK" | "LIGHT" | "SYSTEM";

export interface UserSettingsData {
  user_id: string;
  account_type: AccountType;
  availability_status: AvailabilityStatus;
  rate_currency: string;
  day_rate?: number | string | null;
  primary_role?: string | null;
  secondary_crafts?: string[] | null;
  union_affiliations?: string | null;
  willing_to_travel: boolean;
  portfolio_url?: string | null;
  resume_url?: string | null;

  // Production House
  company_name?: string | null;
  tax_id?: string | null;
  registered_address?: string | null;
  verified_banner: boolean;
  default_nda_template?: string | null;

  // Security & Verification
  is_two_factor_enabled: boolean;
  identity_verified: boolean;

  // Notification Matrix
  notify_chat: boolean;
  notify_application_status: boolean;
  notify_casting_matches: boolean;
  notify_email_digest: boolean;
  notify_sms_urgent: boolean;
  dnd_enabled: boolean;
  dnd_start_time?: string | null;
  dnd_end_time?: string | null;

  // Media & Storage
  stream_quality: StreamQuality;
  cached_media_bytes: number;

  // Theme & Status
  theme_mode: ThemeMode;
  account_status: string;
  updated_at: string;
}

export interface ActiveSessionData {
  session_id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export interface ActiveSessionsResponse {
  sessions: ActiveSessionData[];
  total_count: number;
}

export interface Toggle2FAResponseData {
  enabled: boolean;
  message: string;
  qr_code_url?: string;
  backup_codes?: string[];
}

export interface DataExportData {
  status: string;
  download_url: string;
  file_name: string;
  size_bytes: number;
  expires_at: string;
  message: string;
}


