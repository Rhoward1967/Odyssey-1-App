export const runSystemAudit = () => {
  console.log('🔍 === SYSTEM AUDIT STARTING ===');
  
  // 1. Check React Router
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);
  
  // 2. Check navigation elements
  const navLinks = document.querySelectorAll('nav a');
  console.log('🔗 Navigation links found:', navLinks.length);
  navLinks.forEach((link, index) => {
    console.log(`   ${index + 1}. ${link.textContent} -> ${link.getAttribute('href')}`);
  });
  
  // 3. Check for Media Center specifically
  const mediaCenterLink = Array.from(navLinks).find(link => 
    link.textContent?.includes('Media Center')
  );
  console.log('📺 Media Center link:', mediaCenterLink ? '✅ Found' : '❌ Missing');
  
  // 4. Check if Sidebar component exists
  const sidebarElement = document.querySelector('[data-component="Sidebar"]');
  console.log('🧩 Sidebar component:', sidebarElement ? '✅ Found' : '❌ Missing');
  
  // 5. Check React (without TypeScript error)
  console.log('⚛️ React detected:', typeof window !== 'undefined');
  
  console.log('🔍 === AUDIT COMPLETE ===');
};

// Auto-run audit
if (typeof window !== 'undefined') {
  setTimeout(runSystemAudit, 2000);
}
