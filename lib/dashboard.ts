/**
 * CareConnect Web — Dashboard API Service
 *
 * Service functions for dashboard data: appointments, patients, doctor profile.
 * All functions use the shared apiRequest client with auth headers.
 *
 * RULE: Components call these functions — never fetch() directly.
 */

import { apiRequest } from './api';

// ─── Types (match backend Pydantic schemas) ─────────────────────────────────

export interface AppointmentResponse {
    id: string;
    hospital_id: string;
    doctor_id: string;
    patient_id: string;
    caregiver_id: string;
    scheduled_time: string;        // ISO datetime
    duration_minutes: number;
    appointment_type: 'VIDEO' | 'IN_PERSON' | 'FOLLOW_UP';
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    reason: string | null;
    meeting_room_id: string | null;
    created_at: string;
}

export interface PatientResponse {
    id: string;
    full_name: string;
    whatsapp_number: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    address: string | null;
    aadhar_number: string | null;
    allergies: string[] | null;
    existing_conditions: string[] | null;
    medical_history_summary: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
}

export interface PatientCreate {
    full_name: string;
    whatsapp_number: string;
    date_of_birth?: string | null;
    gender?: string | null;
    blood_group?: string | null;
    address?: string | null;
    aadhar_number?: string | null;
    allergies?: string[];
    existing_conditions?: string[];
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    caregiver_id?: string;
    hospital_id?: string;
}

export interface DoctorProfile {
    id: string;
    full_name: string;
    specialization: string;
    phone_number: string | null;
    avatar_url: string | null;
    hospital_affiliation: string | null;
    years_of_experience: string | null;
    bio: string | null;
    license_number: string | null;
    consultation_duration_minutes: number | null;
    consultation_fee: number | null;
    currency: string;
    accepted_payment_methods: string[] | null;
    onboarding_completed: boolean;
    availability_slots: DoctorAvailabilitySlot[];
}

export interface DoctorAvailabilitySlot {
    day_of_week: string;
    start_time: string;   // HH:MM
    end_time: string;     // HH:MM
    is_enabled: boolean;
}

export interface VideoSessionResponse {
    room_name: string;
    join_token: string;
    patient_join_token?: string;
}

export interface VideoJoinResponse {
    room_name: string;
    join_token: string;
    patient_join_token?: string;
}

// ─── Appointment Functions ──────────────────────────────────────────────────

export async function getAppointments(): Promise<AppointmentResponse[]> {
    return apiRequest<AppointmentResponse[]>({
        method: 'GET',
        path: '/appointments',
    });
}

export async function getAppointment(id: string): Promise<AppointmentResponse> {
    return apiRequest<AppointmentResponse>({
        method: 'GET',
        path: `/appointments/${id}`,
    });
}

export async function updateAppointmentStatus(
    id: string,
    status: AppointmentResponse['status'],
): Promise<AppointmentResponse> {
    return apiRequest<AppointmentResponse>({
        method: 'PATCH',
        path: `/appointments/${id}/status`,
        body: { status },
    });
}

// ─── Patient Functions ──────────────────────────────────────────────────────

export async function getPatients(): Promise<PatientResponse[]> {
    return apiRequest<PatientResponse[]>({
        method: 'GET',
        path: '/patients',
    });
}

export async function addPatient(data: PatientCreate): Promise<PatientResponse> {
    return apiRequest<PatientResponse>({
        method: 'POST',
        path: '/patients',
        body: data as unknown as Record<string, unknown>,
    });
}

export interface PrescriptionResponse {
    id: string;
    medication_name: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    notes: string | null;
    doctor_id: string;
    patient_id: string;
    medical_record_id: string | null;
    created_at: string;
}

export interface MedicalRecordResponse {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_id: string | null;
    diagnosis: string;
    symptoms: string | null;
    treatment: string | null;
    follow_up_date: string | null;
    vitals: Record<string, string> | null;
    prescriptions: PrescriptionResponse[];
    created_at: string;
}

export async function getPatientRecords(patientId: string): Promise<MedicalRecordResponse[]> {
    return apiRequest<MedicalRecordResponse[]>({
        method: 'GET',
        path: `/patients/${patientId}/records`,
    });
}

// ─── Doctor Profile / Onboarding ────────────────────────────────────────────

export async function getDoctorProfile(): Promise<DoctorProfile> {
    return apiRequest<DoctorProfile>({
        method: 'GET',
        path: '/doctors/profile',
    });
}

export async function submitDoctorOnboarding(data: {
    full_name: string;
    specialization: string;
    years_of_experience?: string;
    license_number?: string;
    hospital_affiliation?: string;
    bio?: string;
    phone_number?: string;
    consultation_duration_minutes?: number;
    consultation_fee?: number;
    currency?: string;
    accepted_payment_methods?: string[];
}): Promise<DoctorProfile> {
    return apiRequest<DoctorProfile>({
        method: 'PUT',
        path: '/doctors/onboarding',
        body: data as unknown as Record<string, unknown>,
    });
}

export async function updateDoctorProfile(data: {
    full_name?: string;
    specialization?: string;
    phone_number?: string;
    license_number?: string;
    hospital_affiliation?: string;
    bio?: string;
    consultation_fee?: number;
    currency?: string;
}): Promise<DoctorProfile> {
    return apiRequest<DoctorProfile>({
        method: 'PATCH',
        path: '/doctors/profile',
        body: data as unknown as Record<string, unknown>,
    });
}

export async function submitDoctorAvailability(
    slots: DoctorAvailabilitySlot[],
): Promise<DoctorAvailabilitySlot[]> {
    return apiRequest<DoctorAvailabilitySlot[]>({
        method: 'PUT',
        path: '/doctors/availability',
        body: slots as unknown as Record<string, unknown>,
    });
}

export interface LicenseVerificationResult {
    is_valid: boolean;
    license_number: string;
    license_state: string;
}

export async function verifyMedicalLicense(file: File): Promise<LicenseVerificationResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<LicenseVerificationResult>({
        method: 'POST',
        path: '/doctors/verify-license',
        body: formData,
    });
}

// ─── Video Session ──────────────────────────────────────────────────────────

export async function startVideoSession(appointmentId: string): Promise<VideoSessionResponse> {
    return apiRequest<VideoSessionResponse>({
        method: 'POST',
        path: `/appointments/${appointmentId}/start-session`,
    });
}

export async function getJoinToken(appointmentId: string): Promise<VideoJoinResponse> {
    return apiRequest<VideoJoinResponse>({
        method: 'GET',
        path: `/appointments/${appointmentId}/join`,
    });
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
    avg_consult_minutes: number;
    total_completed: number;
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
    return apiRequest<DashboardStatsResponse>({
        method: 'GET',
        path: '/doctors/dashboard-stats',
    });
}

// ─── Appointment Creation (Instant Meeting + Follow-Up) ─────────────────────

export interface CreateAppointmentPayload {
    doctor_id: string;
    patient_id: string;
    hospital_id: string;
    scheduled_time: string;        // ISO datetime
    duration_minutes?: number;
    appointment_type?: 'VIDEO' | 'IN_PERSON' | 'FOLLOW_UP' | 'NEW_PATIENT';
    caregiver_id?: string | null;
    reason?: string | null;
}

export async function createAppointment(data: CreateAppointmentPayload): Promise<AppointmentResponse> {
    return apiRequest<AppointmentResponse>({
        method: 'POST',
        path: '/appointments',
        body: data as unknown as Record<string, unknown>,
    });
}

// ─── Available Slots ────────────────────────────────────────────────────────

export interface AvailableSlot {
    start_time: string;   // HH:MM
    end_time: string;     // HH:MM
}

export async function getAvailableSlots(doctorId: string, date: string): Promise<AvailableSlot[]> {
    return apiRequest<AvailableSlot[]>({
        method: 'GET',
        path: '/appointments/available-slots',
        params: { doctor_id: doctorId, date },
    });
}

// ─── Doctor Notes (in-call) ─────────────────────────────────────────────────

export interface DoctorNoteResponse {
    id: string;
    appointment_id: string;
    doctor_id: string;
    content: string;
    created_at: string;
}

export async function createDoctorNote(appointmentId: string, content: string): Promise<DoctorNoteResponse> {
    return apiRequest<DoctorNoteResponse>({
        method: 'POST',
        path: '/doctor-notes',
        body: { appointment_id: appointmentId, content },
    });
}

export async function getDoctorNotes(appointmentId: string): Promise<DoctorNoteResponse[]> {
    return apiRequest<DoctorNoteResponse[]>({
        method: 'GET',
        path: `/doctor-notes/${appointmentId}`,
    });
}

// ─── Post-Call Summary ──────────────────────────────────────────────────────

export interface PostCallSummaryResponse {
    id: string;
    appointment_id: string;
    diagnosis: string | null;
    symptoms: string[] | null;
    treatment_plan: string | null;
    prescriptions: string[] | null;
    follow_up: string | null;
    doctor_notes: string | null;
    summary: string | null;         // Full bilingual JSON from AI pipeline
    created_at: string;
}

export async function getPostCallSummary(appointmentId: string): Promise<PostCallSummaryResponse> {
    return apiRequest<PostCallSummaryResponse>({
        method: 'GET',
        path: `/appointments/${appointmentId}/summary`,
    });
}

