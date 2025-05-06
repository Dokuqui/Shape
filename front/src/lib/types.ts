export interface User {
  id: number;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cover_image_url?: string;
  video_url?: string;
  photos: Photo[];
}

export interface Photo {
  id: number;
  file_url: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type EventFormValues = {
  id?: number
  title: string
  description: string
  date: string
  location: string
  cover_image_url: string
};
