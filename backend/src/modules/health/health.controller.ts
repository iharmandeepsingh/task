import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'System Health Status Endpoint' })
  @ApiResponse({ status: 200, description: 'Service is operational' })
  checkHealth() {
    return {
      status: 'ok',
      service: 'CT University Task System API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
