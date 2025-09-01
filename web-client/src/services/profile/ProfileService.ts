import { APIService } from '../api/APIService';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    twoFactor: boolean;
    language: string;
    currency: string;
    travelStyle: string[];
    interests: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: any;
}

export class ProfileService {
  private static baseUrl = '/api/v1/profile';

  static async getProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await APIService.get(`${this.baseUrl}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  static async createProfile(userId: string, profileData: Omit<ProfileUpdateData, 'id'>): Promise<UserProfile> {
    try {
      const response = await APIService.post(`${this.baseUrl}/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, profileData: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await APIService.put(`${this.baseUrl}/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  static async uploadAvatar(userId: string, file: File): Promise<{ message: string; avatar: string; profile: UserProfile }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await APIService.post(`${this.baseUrl}/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  static async deleteProfile(userId: string): Promise<void> {
    try {
      await APIService.delete(`${this.baseUrl}/${userId}`);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }

  static validateProfileData(data: ProfileUpdateData): string[] {
    const errors: string[] = [];

    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
      errors.push('Format de numéro de téléphone invalide');
    }

    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.push('Date de naissance invalide');
      } else if (date > new Date()) {
        errors.push('La date de naissance ne peut pas être dans le futur');
      }
    }

    return errors;
  }

  static validateAvatarFile(file: File): string[] {
    const errors: string[] = [];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      errors.push('La taille du fichier ne doit pas dépasser 2MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Seuls les fichiers JPEG, PNG et GIF sont autorisés');
    }

    return errors;
  }
}