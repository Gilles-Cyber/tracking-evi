export type Page = 'home' | 'search' | 'tracking' | 'confirmation' | 'admin' | 'shipment' | 'profile' | 'history' | 'historique' | 'documents' | 'support' | 'settings' | 'login';

export interface Shipment {
    id: string;
    origin: string;
    dest: string;
    date: string;
    status: 'Transit' | 'Paused' | 'Delayed' | 'Customs Hold' | 'Delivered' | 'Alert' | 'Pending' | 'Spoiled';
    value: string;
    driver: string;
    progress: number;
    vehicle_type: 'ground' | 'air' | 'sea';
    admin_message?: string;
    animation_speed?: number; // seconds for one full loop (default: 15)
    session_id?: string;      // anonymous session identifier
    
    // Advanced Logistics
    weight?: number;
    dimensions?: string;
    cargo_type?: string;
    priority?: 'Standard' | 'Priority' | 'Critical';
    hazardous?: boolean;
    estimated_arrival?: string; // ISO date string, set by admin
    sender_name?: string;
    sender_email?: string;
    sender_phone?: string;
    route_waypoints?: string[];
}

export interface ChatMessage {
    id: string;
    created_at: string;
    text: string;
    sender_type: 'user' | 'admin';
    session_id: string;
    is_read: boolean;
}
