'use client';

import { useEffect } from 'react';
import { APDL } from '@apdl-oss/sdk';

export default function APDLInit() {
  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APDL_URL;
    const clientKey = process.env.NEXT_PUBLIC_APDL_CLIENT_KEY;

    if (!endpoint || !clientKey) {
      console.warn(
        '[APDL] init skipped: set NEXT_PUBLIC_APDL_URL and NEXT_PUBLIC_APDL_CLIENT_KEY in .env.local',
      );
      return;
    }

    const apdl = APDL.init({
      endpoint,
      auth: { clientKey },
      autoCapture: true,
      privacyMode: 'standard',
    });

    return () => {
      apdl.shutdown();
    };
  }, []);

  return null;
}
