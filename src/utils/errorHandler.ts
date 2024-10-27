import { Logger } from './logger';

const logger = new Logger('errorHandler');

type ErrorDisplayOptions = {
  duration?: number;
  className?: string;
};

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorContainer: HTMLDivElement | null = null;

  private constructor() {
    this.initializeErrorContainer();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private initializeErrorContainer() {
    // Create error container if it doesn't exist
    if (!document.getElementById('error-container')) {
      this.errorContainer = document.createElement('div');
      this.errorContainer.id = 'error-container';
      this.errorContainer.className =
        'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      document.body.appendChild(this.errorContainer);
    } else {
      this.errorContainer = document.getElementById(
        'error-container'
      ) as HTMLDivElement;
    }
  }

  public showError(message: string, options: ErrorDisplayOptions = {}) {
    const { duration = 5000, className = '' } = options;

    const errorElement = document.createElement('div');
    errorElement.className = `bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-xs ${className}`;
    errorElement.innerHTML = message;

    this.errorContainer?.appendChild(errorElement);

    // Animate in
    errorElement.style.opacity = '0';
    errorElement.style.transform = 'translateY(20px)';
    setTimeout(() => {
      errorElement.style.transition = 'all 0.3s ease-out';
      errorElement.style.opacity = '1';
      errorElement.style.transform = 'translateY(0)';
    }, 0);

    // Remove after duration
    setTimeout(() => {
      errorElement.style.opacity = '0';
      errorElement.style.transform = 'translateY(-20px)';
      setTimeout(() => errorElement.remove(), 300);
    }, duration);
  }

  public handleError(error: unknown, context?: string) {
    const errorMessage =
      error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
    logger.error(context ? `${context}: ${errorMessage}` : errorMessage, error);
    this.showError(errorMessage);
  }
}

// Helper function to wrap any async function with error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(error, context);
      throw error;
    }
  };
}
