export interface Rol {
    id?: number;
    name: string;
}
export interface Usuario {
    id?: number;
    name?: string;
    username: string;
    password?: string;
    rolId?: number;
    rol?: Rol;
}
export interface FileModel {
    id: number;
    name: string;
    mimetype: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    owner?: Usuario;
    createdAt?: Date;
    updatedAt?: Date;
    isStarred?: boolean;
    isShared?: boolean;
}
export interface Folder {
    id?: number;
    name: string;
    path: string;
    owner?: Usuario;
    isStarred?: boolean;
    isShared?: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface LoginResponse {
    user: Usuario;
    token: string;
}
export interface ShareLinkData {
    id: string;
    accessType: 'public' | 'private' | 'readonly';
    expiresAt?: Date;
    linkCode: string;
    url: string;
}