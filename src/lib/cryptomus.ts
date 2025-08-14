import crypto from 'crypto';

export interface CryptomusPaymentRequest {
  amount: string;
  currency: string;
  order_id: string;
  network?: string;
  url_callback?: string;
  to_currency?: string;
  lifetime?: number;
}

export interface CryptomusPaymentResponse {
  state: number;
  result?: {
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount?: string;
    payer_amount?: string;
    payer_currency?: string;
    currency: string;
    merchant_amount?: string;
    network?: string;
    address?: string;
    url: string;
    expired_at: number;
    status: string;
    is_final: boolean;
  };
  message?: string;
}

export interface CryptomusPayoutRequest {
  amount: string;
  currency: string;
  order_id: string;
  address: string;
  network: string;
  is_subtract: boolean;
  url_callback?: string;
}

export interface CryptomusPayoutResponse {
  state: number;
  result?: {
    uuid: string;
    amount: string;
    currency: string;
    network: string;
    address: string;
    txid?: string;
    status: string;
    is_final: boolean;
    balance: number;
    payer_currency: string;
    payer_amount: string;
  };
  message?: string;
}

export interface CryptomusWebhookPayment {
  type: 'payment';
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: string;
  from?: string;
  network: string;
  currency: string;
  payer_currency: string;
  txid?: string;
  sign: string;
}

export interface CryptomusWebhookPayout {
  type: 'payout';
  uuid: string;
  order_id: string;
  amount: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: string;
  txid?: string;
  currency: string;
  network: string;
  payer_currency: string;
  payer_amount: string;
  sign: string;
}

class CryptomusAPI {
  private merchantId: string;
  private apiKey: string;
  private payoutApiKey: string;
  private baseUrl = 'https://api.cryptomus.com/v1';

  constructor() {
    this.merchantId = process.env.CRYPTOMUS_MERCHANT_ID || '';
    this.apiKey = process.env.CRYPTOMUS_API_KEY || '';
    this.payoutApiKey = process.env.CRYPTOMUS_PAYOUT_API_KEY || '';
  }

  private generateSign(data: any, apiKey: string): string {
    const jsonData = JSON.stringify(data, null, 0);
    const base64Data = Buffer.from(jsonData).toString('base64');
    return crypto.createHash('md5').update(base64Data + apiKey).digest('hex');
  }

  private async makeRequest(
    endpoint: string,
    data: any,
    apiKey: string
  ): Promise<any> {
    const sign = this.generateSign(data, apiKey);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': this.merchantId,
        'sign': sign,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Создание платежа (пополнение)
  async createPayment(data: CryptomusPaymentRequest): Promise<CryptomusPaymentResponse> {
    return await this.makeRequest('/payment', data, this.apiKey);
  }

  // Получение информации о платеже
  async getPaymentInfo(uuid?: string, order_id?: string): Promise<CryptomusPaymentResponse> {
    const data: any = {};
    if (uuid) data.uuid = uuid;
    if (order_id) data.order_id = order_id;

    return await this.makeRequest('/payment/info', data, this.apiKey);
  }

  // Создание выплаты (вывод)
  async createPayout(data: CryptomusPayoutRequest): Promise<CryptomusPayoutResponse> {
    return await this.makeRequest('/payout', data, this.payoutApiKey);
  }

  // Получение информации о выплате
  async getPayoutInfo(uuid?: string, order_id?: string): Promise<CryptomusPayoutResponse> {
    const data: any = {};
    if (uuid) data.uuid = uuid;
    if (order_id) data.order_id = order_id;

    return await this.makeRequest('/payout/info', data, this.payoutApiKey);
  }

  // Получение списка доступных сервисов для платежей
  async getPaymentServices(): Promise<any> {
    return await this.makeRequest('/payment/services', {}, this.apiKey);
  }

  // Получение списка доступных сервисов для выплат
  async getPayoutServices(): Promise<any> {
    return await this.makeRequest('/payout/services', {}, this.payoutApiKey);
  }

  // Проверка подписи webhook
  verifyWebhookSignature(data: any, signature: string, isPayment: boolean = true): boolean {
    const { sign, ...dataWithoutSign } = data;
    const apiKey = isPayment ? this.apiKey : this.payoutApiKey;
    const expectedSign = this.generateSign(dataWithoutSign, apiKey);
    return expectedSign === signature;
  }
}

export const cryptomusAPI = new CryptomusAPI();
