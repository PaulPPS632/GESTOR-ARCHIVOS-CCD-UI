export interface Rol {
    id?: number;
    name: string;
}
export interface Usuario {
    id?: number;
    name?: string;
    email: string;
    password?: string;
    rolId?: number;
    rol?: Rol;
    sharedFolders?: sharedFolders[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface FileModel {
    id: number;
    name: string;
    mimetype: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    path: string;
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
    accessType?: 'editor' | 'lector';
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
export interface sharedFolders {
    id?: number;
    path: string;
    accessType: 'public' | 'editor' | 'lector';
    createdAt?: Date;
    updatedAt?: Date;
}