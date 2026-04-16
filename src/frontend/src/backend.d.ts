import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    principal: Principal;
    displayName: string;
    joinedAt: bigint;
    totalGenerations: bigint;
}
export interface Generation {
    id: string;
    title: string;
    userId: Principal;
    createdAt: bigint;
    type: GenerationType;
    prompt: string;
}
export enum GenerationType {
    PDF = "PDF",
    PPT = "PPT",
    Chat = "Chat",
    Website = "Website",
    Image = "Image",
    Document = "Document",
    Abstract = "Abstract",
    Project = "Project",
    Video = "Video"
}
export interface backendInterface {
    deleteGeneration(userId: Principal, genId: string): Promise<boolean>;
    getActiveUsers(): Promise<bigint>;
    getGenerationHistory(userId: Principal, limit: bigint): Promise<Array<Generation>>;
    getTotalGenerations(): Promise<bigint>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    saveGeneration(userId: Principal, genType: GenerationType, prompt: string, title: string): Promise<string>;
    updateUserProfile(principal: Principal, displayName: string): Promise<boolean>;
}
