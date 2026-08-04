enum Environment { dev, test, prod }

class EnvConfig {
  final Environment environment;
  final String apiBaseUrl;
  final String socketUrl;
  final int connectTimeoutMs;

  const EnvConfig({
    required this.environment,
    required this.apiBaseUrl,
    required this.socketUrl,
    this.connectTimeoutMs = 15000,
  });

  static const EnvConfig dev = EnvConfig(
    environment: Environment.dev,
    apiBaseUrl: 'http://10.0.2.2:3000/api/v1', // Android emulator localhost
    socketUrl: 'http://10.0.2.2:3000',
  );

  static const EnvConfig test = EnvConfig(
    environment: Environment.test,
    apiBaseUrl: 'https://test-api.ctu.edu.in/api/v1',
    socketUrl: 'https://test-api.ctu.edu.in',
  );

  static const EnvConfig prod = EnvConfig(
    environment: Environment.prod,
    apiBaseUrl: 'https://api.ctu.edu.in/api/v1',
    socketUrl: 'https://api.ctu.edu.in',
  );
}
