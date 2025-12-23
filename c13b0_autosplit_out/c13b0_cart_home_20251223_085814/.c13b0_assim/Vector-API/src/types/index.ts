export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Vector {
  id: string;
  name: string;
  dimensions: number[];
  magnitude: number;
  direction: number[];
  timestamp: Date;
}

export interface VectorOperation {
  id: string;
  type: 'add' | 'subtract' | 'multiply' | 'normalize' | 'transform';
  inputVectors: string[];
  resultVector: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
}

export interface PortalConfig {
  theme: 'dark' | 'light' | 'auto';
  vectorVisualization: boolean;
  realTimeUpdates: boolean;
  neuromorphicMode: boolean;
}
