import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentButton from '../PaymentButton';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { initiatePayment } from '../../lib/razorpay';

// Mock the modules
jest.mock('../../context/AuthContext');
jest.mock('sonner');
jest.mock('../../lib/razorpay');

describe('PaymentButton', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
  };

  const defaultProps = {
    amount: 999,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders correctly', () => {
    render(<PaymentButton {...defaultProps} />);
    expect(screen.getByText('Pay ₹999')).toBeInTheDocument();
  });

  it('shows loading state when processing payment', async () => {
    render(<PaymentButton {...defaultProps} />);
    const button = screen.getByText('Pay ₹999');
    fireEvent.click(button);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('requires user to be signed in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<PaymentButton {...defaultProps} />);
    const button = screen.getByText('Pay ₹999');
    fireEvent.click(button);
    expect(toast.error).toHaveBeenCalledWith('Please sign in to make a payment');
  });

  it('handles successful payment', async () => {
    (initiatePayment as jest.Mock).mockResolvedValue({});
    render(<PaymentButton {...defaultProps} />);
    
    const button = screen.getByText('Pay ₹999');
    fireEvent.click(button);

    await waitFor(() => {
      expect(initiatePayment).toHaveBeenCalledWith({
        amount: 999,
        userId: 'test-uid',
        name: 'Analytics Dashboard',
        description: 'Payment for Analytics Dashboard',
        prefill: {
          name: 'test',
          email: 'test@example.com',
          contact: ''
        }
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('handles payment failure', async () => {
    const error = new Error('Payment failed');
    (initiatePayment as jest.Mock).mockRejectedValue(error);
    render(<PaymentButton {...defaultProps} />);
    
    const button = screen.getByText('Pay ₹999');
    fireEvent.click(button);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(error);
    });
  });
});
