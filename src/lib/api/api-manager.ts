interface APIConfig {
  name: string;
  key: string;
  baseUrl?: string;
  enabled: boolean;
  features: string[];
  components: string[];
}

class APIManager {
  private configs: Map<string, APIConfig> = new Map();
  
  registerAPI(config: APIConfig) {
    this.configs.set(config.name, config);
  }
  
  getAPI(name: string): APIConfig | null {
    return this.configs.get(name) || null;
  }
  
  getEnabledAPIs(): APIConfig[] {
    return Array.from(this.configs.values()).filter(api => api.enabled);
  }
  
  // Dynamic capability checking
  hasCapability(capability: string): boolean {
    return Array.from(this.configs.values()).some(
      api => api.enabled && api.features.includes(capability)
    );
  }
}

export const apiManager = new APIManager();

// Core AI APIs
apiManager.registerAPI({
  name: 'openai',
  key: process.env.OPENAI_API_KEY || '',
  enabled: !!process.env.OPENAI_API_KEY,
  features: ['text-generation', 'code-analysis', 'document-processing'],
  components: ['QuantumCore', 'ThoughtProcessor', 'ResearchExports']
});

apiManager.registerAPI({
  name: 'anthropic',
  key: process.env.ANTHROPIC_API_KEY || '',
  enabled: !!process.env.ANTHROPIC_API_KEY,
  features: ['reasoning', 'ethics-analysis', 'self-evolution'],
  components: ['SelfEvolutionEngine', 'EthicalFramework']
});

// Business APIs
apiManager.registerAPI({
  name: 'google_calendar',
  key: process.env.GOOGLE_CALENDAR_API_KEY || '',
  enabled: !!process.env.GOOGLE_CALENDAR_API_KEY,
  features: ['scheduling', 'event-management', 'calendar-sync'],
  components: ['WorkforceDashboard', 'Schedule']
});

apiManager.registerAPI({
  name: 'stripe',
  key: process.env.STRIPE_SECRET_KEY || '',
  enabled: !!process.env.STRIPE_SECRET_KEY,
  features: ['payments', 'payroll', 'subscriptions'],
  components: ['PayrollProcessing', 'Subscription']
});
