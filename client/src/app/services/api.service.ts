import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Metrics, TriageResult, TicketRecord, KnowledgeBaseDoc } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  triageTicket(ticket: string, options?: { ragTopK?: number }) {
    return firstValueFrom(
      this.http.post<{ success: boolean; data: TriageResult }>('/api/triage', { ticket, options })
    );
  }

  getMetrics() {
    return firstValueFrom(
      this.http.get<{ success: boolean; data: Metrics }>('/api/metrics')
    );
  }

  resetMetrics() {
    return firstValueFrom(
      this.http.delete<{ success: boolean; message: string }>('/api/metrics')
    );
  }

  getKnowledgeBase(params?: { full?: boolean; category?: string }) {
    return firstValueFrom(
      this.http.get<{ success: boolean; count: number; data: KnowledgeBaseDoc[] }>(
        '/api/knowledge-base',
        { params: params as Record<string, string | boolean> }
      )
    );
  }

  searchKnowledgeBase(q: string, topK?: number) {
    return firstValueFrom(
      this.http.get<{ success: boolean; query: string; count: number; data: KnowledgeBaseDoc[] }>(
        '/api/knowledge-base/search',
        { params: topK ? { q, topK } : { q } }
      )
    );
  }

  getTickets(limit = 20) {
    return firstValueFrom(
      this.http.get<{ success: boolean; count: number; data: TicketRecord[] }>(
        '/api/tickets', { params: { limit } }
      )
    );
  }

  getHealth() {
    return firstValueFrom(
      this.http.get<{ status: string; service: string; timestamp: string; version: string }>('/health')
    );
  }
}
