import 'package:dio/dio.dart';
import '../config/env_config.dart';

class ApiClient {
  final Dio dio;

  ApiClient({Dio? customDio, EnvConfig? config})
      : dio = customDio ??
            Dio(
              BaseOptions(
                baseUrl: (config ?? EnvConfig.dev).apiBaseUrl,
                connectTimeout: Duration(milliseconds: (config ?? EnvConfig.dev).connectTimeoutMs),
                receiveTimeout: const Duration(milliseconds: 15000),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            );
}
