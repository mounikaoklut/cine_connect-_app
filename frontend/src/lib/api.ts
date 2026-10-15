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
  static async register(data: { email: string; password: string; name: string }) {
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

  static async sendOtp(phone: string) {
    return this.request<{ message: string }>("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  static async verifyOtp(data: { phone: string; otp: string }) {
    const res = await this.request<any>("/auth/otp/verify", {
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
}
