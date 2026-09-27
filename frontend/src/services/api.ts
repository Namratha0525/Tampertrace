import axios from 'axios';
import { AuthResponse, DashboardStats, Document, KeyPair, SignResponse, VerificationLog, VerificationResult } from '../types';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data: { username: string; password: string }) => api.post<AuthResponse>('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) => api.post<AuthResponse>('/auth/register', data),
  getMe: () => api.get<any>('/auth/me'),
};

export const keyService = {
  generate: (name?: string) => api.post<KeyPair>('/keys/generate', { name: name || 'Default Key' }),
  getAll: () => api.get<KeyPair[]>('/keys'),
  getDetails: (id: string) => api.get<KeyPair>(`/keys/${id}`),
  downloadPublicKey: (id: string) => api.get(`/keys/${id}/download`, { responseType: 'blob' }),
};

export const documentService = {
  sign: (file: File, keyId: string, documentName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key_id', keyId);
    formData.append('document_name', documentName);
    return api.post<SignResponse>('/documents/sign', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get<Document[]>('/documents'),
  getDetails: (id: string) => api.get<any>(`/documents/${id}`),
  downloadPackage: (id: string) => api.get(`/documents/${id}/package`, { responseType: 'blob' }),
  getMerkleTree: (id: string) => api.get(`/documents/${id}/merkle`),
};

export const verificationService = {
  verifyPackage: (packageFile: File) => {
    const formData = new FormData();
    formData.append('package', packageFile);
    return api.post<VerificationResult>('/documents/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  verifyManual: (document: File, signatureFile: File, publicKeyFile: File, manifestFile: File) => {
    const formData = new FormData();
    formData.append('file', document);
    formData.append('signature_json', signatureFile);
    formData.append('public_key_pem', publicKeyFile);
    formData.append('manifest_json', manifestFile);
    return api.post<VerificationResult>('/documents/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get<VerificationLog[]>('/verifications'),
  getDetails: (id: string) => api.get<any>(`/verifications/${id}`),
  getReport: (id: string) => api.get(`/verifications/${id}/report`, { responseType: 'blob' }),
};

export const statService = {
  getStats: () => api.get<DashboardStats>('/stats'),
};
