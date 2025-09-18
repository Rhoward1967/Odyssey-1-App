interface OpenAIConfig {
  apiKey: string;
  dailyLimit: number;
  requestLimit: number;
  model: string;
}

interface UsageStats {
  dailySpent: number;
  requestsToday: number;
  lastReset: string;
}

class OpenAIService {
  private config: OpenAIConfig;
  private usage: UsageStats;
  private requestQueue: Array<() => Promise<void>> = [];
  private processing = false;

  constructor() {
    this.config = {
      apiKey: localStorage.getItem('openai_api_key') || '',
      dailyLimit: parseFloat(localStorage.getItem('daily_limit') || '10'),
      requestLimit: parseInt(localStorage.getItem('request_limit') || '100'),
      model: localStorage.getItem('openai_model') || 'gpt-3.5-turbo'
    };

    this.usage = this.loadUsage();
    this.resetIfNewDay();
  }

  private loadUsage(): UsageStats {
    const stored = localStorage.getItem('openai_usage');
    return stored ? JSON.parse(stored) : {
      dailySpent: 0,
      requestsToday: 0,
      lastReset: new Date().toDateString()
    };
  }

  private saveUsage() {
    localStorage.setItem('openai_usage', JSON.stringify(this.usage));
  }

  private resetIfNewDay() {
    const today = new Date().toDateString();
    if (this.usage.lastReset !== today) {
      this.usage = {
        dailySpent: 0,
        requestsToday: 0,
        lastReset: today
      };
      this.saveUsage();
    }
  }

  async chat(message: string, systemPrompt?: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (this.usage.dailySpent >= this.config.dailyLimit) {
      throw new Error(`Daily spending limit of $${this.config.dailyLimit} reached`);
    }

    if (this.usage.requestsToday >= this.config.requestLimit) {
      throw new Error(`Daily request limit of ${this.config.requestLimit} reached`);
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await this.makeRequest(message, systemPrompt);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;
    const request = this.requestQueue.shift();
    if (request) {
      await request();
      // Rate limiting: wait 1 second between requests
      setTimeout(() => {
        this.processing = false;
        this.processQueue();
      }, 1000);
    } else {
      this.processing = false;
    }
  }

  private async makeRequest(message: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: 150, // Keep responses short to control costs
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid JSON response from OpenAI API');
    }
    
    // Estimate cost (rough calculation)
    const estimatedCost = this.estimateCost(data.usage?.total_tokens || 150);
    this.usage.dailySpent += estimatedCost;
    this.usage.requestsToday += 1;
    this.saveUsage();

    return data.choices?.[0]?.message?.content || 'No response received';
  }

  private estimateCost(tokens: number): number {
    // GPT-3.5-turbo pricing: ~$0.002 per 1K tokens
    // GPT-4 pricing: ~$0.03 per 1K tokens
    const pricePerToken = this.config.model.includes('gpt-4') ? 0.00003 : 0.000002;
    return tokens * pricePerToken;
  }

  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey) {
      localStorage.setItem('openai_api_key', newConfig.apiKey);
    }
    if (newConfig.dailyLimit !== undefined) {
      localStorage.setItem('daily_limit', newConfig.dailyLimit.toString());
    }
    if (newConfig.requestLimit !== undefined) {
      localStorage.setItem('request_limit', newConfig.requestLimit.toString());
    }
    if (newConfig.model) {
      localStorage.setItem('openai_model', newConfig.model);
    }
  }

  getUsage(): UsageStats & { remainingBudget: number; remainingRequests: number } {
    return {
      ...this.usage,
      remainingBudget: Math.max(0, this.config.dailyLimit - this.usage.dailySpent),
      remainingRequests: Math.max(0, this.config.requestLimit - this.usage.requestsToday)
    };
  }

  getConfig(): OpenAIConfig {
    return { ...this.config };
  }
}

export const openAIService = new OpenAIService();