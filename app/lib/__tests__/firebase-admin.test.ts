import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '../firebase-admin';

jest.mock('firebase-admin/app');
jest.mock('firebase-admin/firestore');

describe('firebase-admin', () => {
  const mockEnv = {
    FIREBASE_PROJECT_ID: 'test-project',
    FIREBASE_CLIENT_EMAIL: 'test@example.com',
    FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...mockEnv };
    (getApps as jest.Mock).mockReturnValue([]);
  });

  it('initializes Firebase Admin SDK correctly', () => {
    initializeFirebaseAdmin();

    expect(cert).toHaveBeenCalledWith({
      projectId: mockEnv.FIREBASE_PROJECT_ID,
      clientEmail: mockEnv.FIREBASE_CLIENT_EMAIL,
      privateKey: mockEnv.FIREBASE_PRIVATE_KEY,
    });

    expect(initializeApp).toHaveBeenCalled();
    expect(getFirestore).toHaveBeenCalled();
  });

  it('returns existing Firestore instance if app is already initialized', () => {
    (getApps as jest.Mock).mockReturnValue(['existing-app']);
    
    initializeFirebaseAdmin();

    expect(initializeApp).not.toHaveBeenCalled();
    expect(getFirestore).toHaveBeenCalled();
  });

  it('throws error if required environment variables are missing', () => {
    process.env = {};

    expect(() => {
      initializeFirebaseAdmin();
    }).toThrow();
  });
});
