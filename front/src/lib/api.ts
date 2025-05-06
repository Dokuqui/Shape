import { User, TokenResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// AUTH
export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });

  if (!response.ok) throw new Error("Échec de la connexion");
  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Échec de la récupération de l’utilisateur");
  return response.json();
}

export async function updateUser(token: string, data: Partial<{ email: string; password: string }>): Promise<User> {
  const response = await fetch(`${API_URL}/admin/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Échec de la mise à jour de l’utilisateur");
  return response.json();
}

// EVENTS
export async function getEvents() {
  const response = await fetch(`${API_URL}/events/`);
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export async function createEvent(formData: FormData) {
  const response = await fetch(`${API_URL}/events/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to create event: ${response.statusText}`);
  return response.json();
}

export async function updateEvent(id: number, formData: FormData) {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to update event: ${response.statusText}`);
  return response.json();
}

export async function deleteEvent(eventId: number): Promise<void> {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Échec de la suppression de l’événement: ${response.status} ${response.statusText} - ${errorData.detail || JSON.stringify(errorData)}`
    );
  }
}

// GALLERY
export async function uploadGalleryPhoto(eventId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/photos/upload/${eventId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Échec de l’upload de la photo : ${response.statusText}`);
  }

  return response.json();
}

export async function getGalleryPhotosByEventId(eventId: number) {
  const response = await fetch(`${API_URL}/photos/events/${eventId}/photos`);
  if (!response.ok) throw new Error("Échec de la récupération de la galerie");
  return response.json();
}

export async function deletePhoto(photoId: number) {
  const response = await fetch(`${API_URL}/photos/${photoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Échec de la suppression de la photo : ${response.statusText}`);
  }
}
