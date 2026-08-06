/* ── Active nav link ── */
(function () {
  const page = location.pathname.split('/').pop() || 'about.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('#')[0];
    if (href === page) a.classList.add('active');
  });
})();

/* ── Reveal on scroll ── */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i % 6, 5) * 0.06 + 's';
    io.observe(el);
  });
})();

/* ── Count-up numbers (hero stats, skills counter) ── */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('.count-up');
  if (counters.length === 0) return;

  function animateCount(el) {
    const target = el.dataset.source
      ? document.querySelectorAll(el.dataset.source).length
      : parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration, 10) || 1100;

    if (reduceMotion) { el.textContent = target + suffix; return; }

    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const counter = entry.target.classList.contains('count-up') ? entry.target : entry.target.querySelector('.count-up');
        if (counter && !counter.dataset.animated) {
          counter.dataset.animated = 'true';
          animateCount(counter);
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c.closest('.hero-stat') || c));
})();

/* ── Skill modal ──
   Each skill maps to a category-relative note and, where genuinely relevant,
   links to the actual lab project page (title is hardcoded here since the
   Skills page doesn't share a DOM with the Projects page). */
const SKILL_INFO = {
  "Server Hardware Setup & Configuration": { links: [], note: "Deployed and configured 250+ HP and Supermicro servers nationwide as part of the PEPFAR digital health infrastructure rollout." },
  "HP Servers": { links: [], note: "Deployed and configured 250+ HP servers nationwide as part of the PEPFAR digital health infrastructure rollout." },
  "Supermicro Servers": { links: [], note: "Deployed and configured Supermicro servers nationwide as part of the PEPFAR digital health infrastructure rollout." },
  "SSD Replication & Swapping": { links: [], note: "Hands-on hardware maintenance and storage swaps performed during the national server deployment." },
  "BIOS / BMC Configuration": { links: [], note: "Performed firmware upgrades and BIOS/BMC configuration across healthcare facility servers." },
  "Firmware Upgrades": { links: [], note: "Performed firmware upgrades and hardware scaling across facilities during the PEPFAR rollout." },
  "Storage & RAM Installation": { links: [], note: "Hardware scaling — storage and RAM installation — across facilities during the PEPFAR server deployment." },

  "IP Addressing & Subnetting": { links: [{ href: "projects.html#basic-network", title: "Basic LAN & Routed Network" }], note: "" },
  "NIC Configuration": { links: [], note: "Applied across home lab builds and desktop support work." },
  "VLANs (802.1Q) & Inter-VLAN Routing": { links: [{ href: "projects.html#vlan", title: "VLANs & Router-on-a-Stick" }], note: "" },
  "Trunking & Static Routing": { links: [{ href: "projects.html#static-routing", title: "Static Routing — Dual-Router Topology" }, { href: "projects.html#vlan", title: "VLANs & Router-on-a-Stick" }], note: "" },
  "DHCP & DNS Configuration": { links: [{ href: "projects.html#dhcp", title: "DHCP Server Configuration" }, { href: "projects.html#dns", title: "DNS Server Deployment (BIND9)" }], note: "" },
  "Default Gateway Configuration": { links: [{ href: "projects.html#lan-internet", title: "LAN-to-Internet Connectivity" }], note: "" },
  "Fortinet Firewalls (FortiGate / FortiOS)": { links: [], note: "Deployed Fortinet firewalls nationwide across healthcare facilities as part of the PEPFAR infrastructure rollout." },
  "Wireless Access Points": { links: [], note: "Configured and deployed wireless access points across healthcare facilities during the Ministry of Health internship." },
  "Network Troubleshooting": { links: [{ href: "projects.html#lan-internet", title: "LAN-to-Internet Connectivity" }], note: "Also applied day-to-day during network troubleshooting and IT support at the Ministry of Health." },

  "Cisco Packet Tracer": { links: [{ href: "projects.html#basic-network", title: "Basic LAN & Routed Network" }, { href: "projects.html#dhcp", title: "DHCP Server Configuration" }, { href: "projects.html#vlan", title: "VLANs & Router-on-a-Stick" }], note: "Used across every Cisco networking lab." },
  "Cisco IOS CLI (Router & Switch Configuration)": { links: [{ href: "projects.html#dhcp", title: "DHCP Server Configuration" }, { href: "projects.html#vlan", title: "VLANs & Router-on-a-Stick" }, { href: "projects.html#static-routing", title: "Static Routing — Dual-Router Topology" }], note: "" },
  "Console & VTY Line Configuration": { links: [{ href: "projects.html#console-telnet", title: "Console Line & Telnet" }], note: "" },
  "Telnet & SSH v2": { links: [{ href: "projects.html#console-telnet", title: "Console Line & Telnet" }, { href: "projects.html#ssh", title: "SSH & Secure Remote Access" }], note: "" },
  "RSA Key Generation": { links: [{ href: "projects.html#ssh", title: "SSH & Secure Remote Access" }], note: "" },
  "Router Subinterfaces": { links: [{ href: "projects.html#vlan", title: "VLANs & Router-on-a-Stick" }], note: "" },

  "Windows Server & Desktop": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },
  "Linux (Ubuntu, Mint)": { links: [{ href: "projects.html#netdata", title: "Netdata Server Monitoring" }, { href: "projects.html#dns", title: "DNS Server Deployment (BIND9)" }, { href: "projects.html#samba", title: "Linux File Server & Samba Access Control" }, { href: "projects.html#backup", title: "Server Backup, Restore & Automation" }], note: "" },
  "FreeBSD": { links: [], note: "Explored in home lab virtualization environment." },
  "macOS": { links: [], note: "Everyday desktop support and administration experience." },
  "OS Installation": { links: [], note: "Routine part of server hardware setup and home lab builds." },
  "VirtualBox": { links: [], note: "Home lab environment used for building and testing Windows Server and Linux systems." },
  "VMware": { links: [], note: "Used for virtualization coursework and lab environments." },

  "Active Directory Domain Services (AD DS)": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },
  "Group Policy Objects (GPO)": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },
  "OU & Group Management": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },
  "Delegated Administration": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },
  "Shared Folders & Permissions": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }, { href: "projects.html#samba", title: "Linux File Server & Samba Access Control" }], note: "" },
  "ADUC": { links: [{ href: "projects.html#ad", title: "Active Directory Administration" }], note: "" },

  "Bash Scripting": { links: [{ href: "projects.html#backup", title: "Server Backup, Restore & Automation" }], note: "" },
  "SOP Authoring & Technical Documentation": { links: [], note: "Authored SOPs to standardise system management across health facilities during the PEPFAR rollout." },
  "Inventory Management": { links: [], note: "Maintained technical documentation and IT inventory during the Ministry of Health internship." },
  "Email Server Administration": { links: [], note: "Part of ongoing IT operations and infrastructure administration work." },
  "Netdata Monitoring": { links: [{ href: "projects.html#netdata", title: "Netdata Server Monitoring" }], note: "" },

  "IT Troubleshooting": { links: [{ href: "projects.html#lan-internet", title: "LAN-to-Internet Connectivity" }], note: "Applied daily during network troubleshooting and IT support work." },
  "RDP, TeamViewer & AnyDesk": { links: [], note: "Used for remote desktop support and troubleshooting." },
  "Microsoft Office Suite (Word, Excel, PowerPoint)": { links: [], note: "Used for documentation, SOPs, spreadsheets, and reporting." },
};

(function () {
  const overlay = document.getElementById('skillModalOverlay');
  if (!overlay) return;

  const modalCat = document.getElementById('skillModalCat');
  const modalTitle = document.getElementById('skillModalTitle');
  const modalNote = document.getElementById('skillModalNote');
  const modalLinksWrap = document.getElementById('skillModalLinksWrap');
  const modalLinks = document.getElementById('skillModalLinks');
  const modalClose = document.getElementById('skillModalClose');

  function openSkillModal(pillEl) {
    const skillText = pillEl.textContent.trim();
    const blockTitle = pillEl.closest('.skill-block, .skill-block-featured').querySelector('.skill-block-title').textContent.replace(/\s*\d+\s*$/, '').trim();
    const info = SKILL_INFO[skillText] || { links: [], note: '' };

    modalCat.textContent = blockTitle;
    modalTitle.textContent = skillText;
    modalNote.textContent = info.note || `Part of the ${blockTitle} toolkit.`;

    modalLinks.innerHTML = '';
    if (info.links && info.links.length > 0) {
      modalLinksWrap.style.display = 'block';
      info.links.forEach(({ href, title }) => {
        const a = document.createElement('a');
        a.href = href;
        a.className = 'skill-modal-link';
        a.innerHTML = `<span>${title}</span><span class="skill-modal-link-arrow">↗</span>`;
        modalLinks.appendChild(a);
      });
    } else {
      modalLinksWrap.style.display = 'none';
    }

    overlay.classList.add('open');
  }

  function closeSkillModal() { overlay.classList.remove('open'); }

  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('click', () => openSkillModal(pill));
    pill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSkillModal(pill); }
    });
  });

  modalClose.addEventListener('click', closeSkillModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSkillModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeSkillModal(); });
})();
