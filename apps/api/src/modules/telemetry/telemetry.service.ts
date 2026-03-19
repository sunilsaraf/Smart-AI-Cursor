export class TelemetryService {
  logEvent(eventName: string, properties?: Record<string, any>) {
    console.log(`[Telemetry] ${eventName}`, properties);
  }

  trackAPICall(endpoint: string, method: string, duration: number, statusCode: number) {
    this.logEvent('api_call', { endpoint, method, duration, statusCode });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.logEvent('error', { message: error.message, stack: error.stack, ...context });
  }
}

export const telemetryService = new TelemetryService();
