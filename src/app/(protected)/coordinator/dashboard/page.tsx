// src/app/(protected)/coordinator/dashboard/page.tsx - ULTRA MINIMAL FOR DIAGNOSIS

export default function CoordinatorDashboardPage() {
  console.log("Rendering ULTRA MINIMAL CoordinatorDashboardPage");
  return (
    <div style={{ border: '2px solid blue', padding: '10px', margin: '10px', backgroundColor: 'lightblue' }}>
      <h1>Coordinator Dashboard - ABSOLUTE MINIMAL TEST</h1>
      <p>If you see this, the Coordinator dashboard page component itself is loading.</p>
      <p>If the &apos;Unsupported Server Component type: undefined&apos; error persists when logging in as Coordinator, the issue is very likely external to this file&apos;s content (e.g., cache, config, layout loading, or a fundamental Next.js issue with this route).</p>
    </div>
  );
}
