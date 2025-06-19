
// This is a Server Component by default.
// src/app/(protected)/admin/dashboard/page.tsx - ULTRA MINIMAL FOR DIAGNOSIS

export default function AdminDashboardPage() {
  console.log("Rendering ULTRA MINIMAL AdminDashboardPage");
  return (
    <div style={{ border: '2px solid green', padding: '10px', margin: '10px', backgroundColor: 'lightgreen' }}>
      <h1>Admin Dashboard - ABSOLUTE MINIMAL TEST</h1>
      <p>If you see this, the page component itself is loading.</p>
      <p>If the &apos;Unsupported Server Component type: undefined&apos; error persists, the issue is very likely external to this file&apos;s content (e.g., cache, config, layout loading, or a fundamental Next.js issue with this route).</p>
    </div>
  );
}
