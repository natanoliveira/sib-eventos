class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Reload token from localStorage if available
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('auth_token')
    }

    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível autenticar')
    }

    if (data.token) {
      this.setToken(data.token)
    }
    return data
  }

  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request<any>('/auth/profile')
  }

  async updateProfile(data: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  // Members endpoints
  async getMembers(params?: { search?: string; role?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/members${query}`)
  }

  async getMember(id: string) {
    return this.request<any>(`/members/${id}`)
  }

  async createMember(data: any) {
    return this.request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMember(id: string, data: any) {
    return this.request<any>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMember(id: string) {
    return this.request<{ message: string }>(`/members/${id}`, {
      method: 'DELETE',
    })
  }

  // Events endpoints
  async getEvents(params?: { status?: string; category?: string; search?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/events${query}`)
  }

  async getEvent(id: string) {
    return this.request<any>(`/events/${id}`)
  }

  async createEvent(data: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEvent(id: string, data: any) {
    return this.request<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  // Tickets endpoints
  async getTickets(params?: { search?: string; eventId?: string; status?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/tickets${query}`)
  }

  async getTicket(id: string) {
    return this.request<any>(`/tickets/${id}`)
  }

  async createTicket(data: any) {
    return this.request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTicket(id: string, data: any) {
    return this.request<any>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTicket(id: string) {
    return this.request<{ message: string }>(`/tickets/${id}`, {
      method: 'DELETE',
    })
  }

  async sendTicketEmail(ticketId: string) {
    return this.request<{ message: string }>(`/tickets/${ticketId}/send`, {
      method: 'POST',
    })
  }

  // Payments endpoints
  async getPayments(params?: { search?: string; status?: string; method?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/payments${query}`)
  }

  async getPayment(id: string) {
    return this.request<any>(`/payments/${id}`)
  }

  async createPaymentIntent(data: { eventId: string; amount: number }) {
    return this.request<{ clientSecret: string; paymentIntentId: string }>('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createStripePaymentIntent(data: {
    eventId: string
    amount: number
    userId?: string
    installments?: number
    method?: string
  }) {
    return this.request<{ clientSecret: string; paymentIntentId: string }>('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createStripePaymentIntentForInstallment(installmentId: string) {
    // This creates a payment intent for a specific installment
    return this.request<{ clientSecret: string; paymentIntentId: string }>('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ installmentId }),
    })
  }

  async confirmPayment(paymentIntentId: string) {
    return this.request<any>(`/payments/${paymentIntentId}/confirm`, {
      method: 'POST',
    })
  }

  async refundPayment(paymentId: string) {
    return this.request<{ message: string }>(`/payments/${paymentId}/refund`, {
      method: 'POST',
    })
  }

  // Installments endpoints
  async getInstallments(params?: { paymentId?: string; status?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/installments${query}`)
  }

  async payInstallment(id: string, stripePaymentIntentId: string, stripeChargeId: string) {
    return this.request<any>(`/installments/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ stripePaymentIntentId, stripeChargeId }),
    })
  }

  async markInstallmentAsPaid(id: string) {
    // Simplified version for manual marking
    return this.payInstallment(id, 'manual', 'manual')
  }

  // Invoice endpoints
  async generateInvoice(data: {
    userId: string
    eventId: string
    amount: number | string
    method: string
    installments?: number | string
    ticketQuantity?: number | string
    ticketType?: string
    firstDueDate?: Date | string
  }) {
    return this.request<any>('/invoices/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Event Registrations endpoints
  async getEventRegistrations(params?: { eventId?: string; userId?: string; status?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any[]>(`/event-registrations${query}`)
  }

  async registerMemberToEvent(userId: string, eventId: string) {
    return this.request<any>('/event-registrations', {
      method: 'POST',
      body: JSON.stringify({ userId, eventId }),
    })
  }

  async updateEventRegistration(id: string, data: any) {
    return this.request<any>(`/event-registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEventRegistration(id: string) {
    return this.request<{ message: string }>(`/event-registrations/${id}`, {
      method: 'DELETE',
    })
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats')
  }

  async getRevenue(params?: { startDate?: string; endDate?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/dashboard/revenue${query}`)
  }
}

export const apiClient = new ApiClient()
