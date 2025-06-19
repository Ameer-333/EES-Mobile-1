// src/app/(protected)/layout.tsx - TEMPORARY DRASTIC SIMPLIFICATION FOR DIAGNOSIS
'use client';

import React from 'react';
// import { usePathname } from 'next/navigation'; // Not using pathname in this simplified version

export default function TemporaryProtectedLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname(); // To see which path is being rendered
  // console.log("Rendering TEMPORARY PROTECTED LAYOUT for path:", pathname);

  return (
    <div style={{ border: '5px solid red', padding: '20px', margin: '20px', backgroundColor: 'lightyellow', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '28px', fontWeight: 'bold', textAlign: 'center' }}>
        DIAGNOSTIC: EXTREMELY SIMPLIFIED (PROTECTED) LAYOUT ACTIVE
      </h1>
      <p style={{ textAlign: 'center', margin: '10px 0' }}>
        This layout bypasses all authentication, context providers, and complex UI.
      </p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}>
        If you see your page content below, the error is likely within the original ProtectedLayout's AppProvider or its complex rendering logic.
      </p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}>
        If you STILL get the 'Unsupported Server Component type: undefined' error, the problem is deeper (e.g., Next.js caching, configuration, or a fundamental issue with the page module loading for this route).
      </p>
      <hr style={{ margin: '20px 0', borderColor: 'red', borderStyle: 'dashed' }} />
      <div style={{ border: '2px dashed darkred', padding: '15px', backgroundColor: 'white' }}>
        {children}
      </div>
    </div>
  );
}
