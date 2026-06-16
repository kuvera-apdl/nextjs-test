import { APDL } from '@apdl-oss/sdk';

const apdl = APDL.init({
  endpoint: process.env.NEXT_PUBLIC_APDL_URL as string,
  auth: {
    clientKey: process.env.NEXT_PUBLIC_APDL_CLIENT_KEY as string,
  },
  autoCapture: true,
  privacyMode: 'standard',
});