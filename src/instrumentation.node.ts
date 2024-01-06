import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

import { env } from "./env";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: env.OTEL_SERVICE_VERSION,
  }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
  instrumentations: [
    new PrismaInstrumentation({ middleware: true }),
    new HttpInstrumentation(),
    new PinoInstrumentation({
      logHook: (span, record) => {
        span.setAttribute("log.record", JSON.stringify(record));
        record["resource.service.name"] = env.OTEL_SERVICE_NAME;
      },
    }),
  ],
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter()),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
});
sdk.start();
