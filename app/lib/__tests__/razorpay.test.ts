import { initiatePayment, loadRazorpayScript } from '../razorpay';

describe('razorpay', () => {
  const mockPaymentDetails = {
    amount: 999,
    userId: 'test-user',
    name: 'Test Payment',
    description: 'Test payment description',
    prefill: {
      name: 'Test User',
      email: 'test@example.com',
      contact: ''
    }
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock fetch
    global.fetch = jest.fn();
    
    // Mock Razorpay script loading
    document.body.appendChild = jest.fn();
    
    // Mock window.Razorpay
    (window as any).Razorpay = jest.fn().mockImplementation(() => ({
      open: jest.fn(),
      on: jest.fn(),
    }));
  });

  describe('loadRazorpayScript', () => {
    it('loads Razorpay script correctly', async () => {
      const scriptPromise = loadRazorpayScript();
      
      // Get the script element that was created
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      // Simulate script load
      script.onload?.(new Event('load'));
      
      await expect(scriptPromise).resolves.toBeUndefined();
      expect(document.body.appendChild).toHaveBeenCalledWith(expect.any(HTMLScriptElement));
    });
  });

  describe('initiatePayment', () => {
    beforeEach(() => {
      // Mock successful order creation
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            orderId: 'test-order-id',
            amount: mockPaymentDetails.amount
          })
        })
      );
    });

    it('creates order and initializes Razorpay payment', async () => {
      const payment = initiatePayment(mockPaymentDetails);

      await expect(global.fetch).toHaveBeenCalledWith('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: mockPaymentDetails.amount,
          userId: mockPaymentDetails.userId
        }),
      });

      expect(window.Razorpay).toHaveBeenCalledWith(expect.objectContaining({
        amount: mockPaymentDetails.amount,
        name: mockPaymentDetails.name,
        description: mockPaymentDetails.description,
        order_id: 'test-order-id',
        prefill: mockPaymentDetails.prefill,
      }));
    });

    it('handles order creation failure', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Failed to create order' })
        })
      );

      await expect(initiatePayment(mockPaymentDetails)).rejects.toThrow('Failed to create order');
    });

    it('handles payment verification', async () => {
      const mockPaymentResponse = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123'
      };

      // Mock verification API call
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            orderId: 'test-order-id',
            amount: mockPaymentDetails.amount
          })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        }));

      const razorpayInstance = new (window as any).Razorpay({});
      razorpayInstance.open();

      // Simulate payment success
      razorpayInstance.handler(mockPaymentResponse);

      await expect(global.fetch).toHaveBeenCalledWith('/api/razorpay', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mockPaymentResponse,
          userId: mockPaymentDetails.userId,
        }),
      });
    });
  });
});
