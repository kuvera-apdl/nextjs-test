import { APDL } from '@apdl-oss/sdk';

export const apdl = APDL.init({
  endpoints: {
    ingestion: process.env.NEXT_PUBLIC_APDL_INGESTION_ENDPOINT as string,
    config: process.env.NEXT_PUBLIC_APDL_CONFIG_ENDPOINT as string,
  },
  auth: {
    clientKey: process.env.NEXT_PUBLIC_APDL_CLIENT_KEY as string,
  },
  autoCapture: true,
  privacyMode: 'standard',
});