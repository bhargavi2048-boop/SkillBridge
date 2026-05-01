// ============================================================
// MapMySkills — Main Application Logic v2.0
// Fix: Manual domain selection is NEVER overridden by auto-detect
//      during analysis. Auto-detect only runs when user hasn't
//      manually selected a domain.
// ============================================================

/* global pdfjsLib, JOB_PROFILES, detectJobDomain, getJobProfile,
          buildAnalysisPrompt, buildRoadmapPrompt,
          generateReportPage, openReportWindow */

let analysisData = null;
let roadmapData  = null;
let currentProfileKey = "software-developer";
let resumeText   = "";
let userManuallySelectedDomain = false; // KEY FIX: track manual vs auto

// ─── API KEY MANAGEMENT ─────────────────────────────────────
function getApiKey() {
  return localStorage.getItem('skillbridge-api-key') || '';
}
function saveApiKey(val) {
  if (val) localStorage.setItem('skillbridge-api-key', val);
  else localStorage.removeItem('skillbridge-api-key');
}
function toggleApiKeyVisibility() {
  const inp = document.getElementById('anthropicApiKey');
  const btn = document.getElementById('apiKeyToggleBtn');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}
// Restore saved API key on load
document.addEventListener('DOMContentLoaded', function() {
  const saved = getApiKey();
  const inp = document.getElementById('anthropicApiKey');
  if (inp && saved) inp.value = saved;
});

// ─── PAGE NAVIGATION ───────────────────────────────────────
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  if (page) {
    page.classList.add("active");
    page.scrollIntoView({ behavior: "instant", block: "start" });
    window.scrollTo(0, 0);
  }
  const navLink = document.querySelector(`.nav-links a[data-page="${id}"]`);
  if (navLink) navLink.classList.add("active");
  // Close mobile nav
  const navLinks = document.querySelector(".nav-links");
  if (navLinks && window.innerWidth < 768) navLinks.classList.remove("open");
  observeReveal();
}

// ─── DEMO TABS ─────────────────────────────────────────────
function switchTab(id) {
  document.querySelectorAll(".demo-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".demo-panel").forEach(p => p.classList.remove("active"));
  const tab = document.querySelector(`.demo-tab[data-tab="${id}"]`);
  const panel = document.getElementById("panel-" + id);
  if (tab) tab.classList.add("active");
  if (panel) panel.classList.add("active");
}

// ─── RESUME INPUT TABS ─────────────────────────────────────
function switchResumeTab(id) {
  document.querySelectorAll(".resume-tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("resumePasteArea").style.display = id === "paste" ? "block" : "none";
  document.getElementById("resumeUploadArea").style.display = id === "upload" ? "block" : "none";
  document.querySelector(`.resume-tab-btn[data-rtab="${id}"]`).classList.add("active");
}

// ─── JOB SELECTOR ──────────────────────────────────────────
function renderJobSelector() {
  const grid = document.getElementById("jobSelectGrid");
  if (!grid) return;
  grid.innerHTML = Object.entries(JOB_PROFILES).map(([key, profile]) => `
    <div class="job-select-card ${key === currentProfileKey ? "selected" : ""}"
         onclick="selectJobProfile('${key}', true)" data-key="${key}">
      <span class="jsc-icon">${profile.icon}</span>
      <div>
        <div class="jsc-name">${profile.label}</div>
        <div class="jsc-domain">${profile.domain}</div>
      </div>
    </div>`).join("");
}

// KEY FIX: added `isManual` param — when user clicks a card it's manual=true
function selectJobProfile(key, isManual = false) {
  currentProfileKey = key;
  if (isManual) userManuallySelectedDomain = true;

  document.querySelectorAll(".job-select-card").forEach(c => {
    c.classList.toggle("selected", c.dataset.key === key);
  });

  const profile = getJobProfile(key);
  const bar = document.getElementById("domainDetectedBar");
  const text = document.getElementById("domainDetectedText");
  if (bar && text) {
    const icon = isManual ? "🎯" : "🤖 Auto-detected:";
    text.innerHTML = `${icon} <strong>${profile.icon} ${profile.label}</strong> — ${profile.domain} domain selected`;
    bar.classList.add("show");
    bar.style.borderColor = isManual ? "rgba(168,85,247,0.3)" : "rgba(0,212,200,0.2)";
  }

  // Update the mini domain tag in results tab header if visible
  const domainTag = document.getElementById("currentDomainTag");
  if (domainTag) domainTag.textContent = `${profile.icon} ${profile.label}`;
}

// ─── AUTO DETECT DOMAIN from job description ───────────────
// ONLY runs if user has NOT manually selected a domain
function autoDetectDomain() {
  if (userManuallySelectedDomain) return; // respect user's choice
  const jd = document.getElementById("jobDescArea")?.value || "";
  if (jd.length < 30) return;
  const detected = detectJobDomain(jd);
  if (detected && detected !== currentProfileKey) {
    selectJobProfile(detected, false); // false = not manual
    // Scroll the job card into view
    const card = document.querySelector(`.job-select-card[data-key="${detected}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Reset manual selection (e.g. when user clears the JD)
function resetDomainSelection() {
  userManuallySelectedDomain = false;
  const bar = document.getElementById("domainDetectedBar");
  if (bar) bar.classList.remove("show");
}

// ─── PDF UPLOAD ─────────────────────────────────────────────
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

async function handlePdfUpload(file) {
  if (!file || file.type !== "application/pdf") {
    showNotif("⚠️", "Please upload a PDF file."); return;
  }
  document.getElementById("pdfStatus").textContent = "⏳ Extracting text from PDF…";
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    resumeText = text.trim();
    document.getElementById("resumeTextArea").value = resumeText;
    document.getElementById("pdfStatus").textContent =
      `✅ Extracted ${resumeText.length.toLocaleString()} characters from ${pdf.numPages} page(s)`;
    // Only auto-detect if user hasn't manually picked
    if (!userManuallySelectedDomain) autoDetectDomain();
    showNotif("📄", `PDF parsed — ${pdf.numPages} page(s) ready!`);
  } catch (err) {
    document.getElementById("pdfStatus").textContent = "❌ Failed to read PDF. Try pasting text instead.";
  }
}

// ─── LOAD SAMPLE DATA ───────────────────────────────────────
function loadSampleData() {
  const profile = getJobProfile(currentProfileKey);
  const samplesByDomain = {
    "software-developer": {
      resume: `John Doe\nSoftware Engineer | Bangalore\njohn@example.com | +91-9876543210\n\nEXPERIENCE\nJunior Developer — StartupXYZ (2022–2024)\n- Built REST APIs with Node.js and Express\n- Implemented React frontend components\n- Used Git for version control\n- Deployed apps on AWS EC2\n\nSKILLS: JavaScript, React, Node.js, HTML, CSS, Git, MySQL, Python (basic)\n\nEDUCATION: B.E. Computer Science — VTU, 2022\nPROJECTS: E-commerce site (React + Node), Blog API (Express + MongoDB)`,
      jd: `Software Engineer — Product Startup\n\nWe are looking for a Software Engineer with:\n- Strong JavaScript and TypeScript skills\n- React.js or Vue.js experience (3+ years)\n- Backend: Node.js / Python / Java\n- Databases: PostgreSQL, MongoDB\n- DevOps: Docker, Kubernetes, CI/CD\n- System design knowledge\n- AWS or GCP experience preferred`
    },
    "graphic-designer": {
      resume: `Ananya Krishnan\nGraphic Designer | Chennai\nananya@design.in | Portfolio: ananya.design\n\nEXPERIENCE\nJunior Graphic Designer — CreativeHub (2023–present)\n- Designed social media graphics and brand collateral\n- Used Adobe Photoshop and Illustrator daily\n- Created basic UI mockups in Figma\n- Produced print-ready brochures in InDesign\n\nSKILLS: Adobe Photoshop, Illustrator, Figma (basic), Canva, Typography, Color Theory\n\nEDUCATION: B.Des Visual Communication — NID, 2022\nPROJECTS: Branding for 3 local startups, Social media kit for NGO`,
      jd: `Senior Graphic Designer — Digital Agency\n\nWe need a creative Graphic Designer with:\n- Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign)\n- Strong Figma skills for UI/UX design\n- Motion graphics / After Effects experience\n- Typography and layout mastery\n- Brand identity design experience\n- 3D design tools (Cinema 4D a plus)\n- Portfolio demonstrating diverse creative work`
    },
    "cybersecurity": {
      resume: `Ravi Menon\nIT Support Analyst | Hyderabad\nravi@techmail.com\n\nEXPERIENCE\nIT Support — TechCorp (2022–2024)\n- Managed network troubleshooting and user support\n- Maintained firewall rules and basic network configs\n- Conducted vulnerability scans with Nessus\n- Completed CompTIA A+ certification\n\nSKILLS: Networking basics, Windows Server, Linux (Ubuntu), Wireshark, Nessus, Python (scripting)\n\nEDUCATION: B.Sc. IT — Anna University, 2021`,
      jd: `Cybersecurity Analyst — FinTech Company\n\nLooking for a Cybersecurity Analyst with:\n- Network security and firewall management\n- SIEM tools: Splunk or IBM QRadar\n- Ethical hacking and penetration testing\n- OWASP Top 10 knowledge\n- Incident response and threat hunting\n- Python/Bash scripting for automation\n- CEH or CompTIA Security+ certification preferred\n- ISO 27001 / NIST framework knowledge`
    },
    "data-analyst": {
      resume: `Priya Sharma\nData Analyst | Mumbai\npriya@email.com\n\nEXPERIENCE\nJunior Data Analyst — FinCorp (2023–present)\n- Created dashboards in Excel and basic Tableau\n- Wrote SQL queries for reporting\n- Cleaned datasets using Python pandas\n\nSKILLS: SQL, Excel, Python, Pandas, Basic Statistics\n\nEDUCATION: B.Sc. Statistics — Mumbai University, 2022`,
      jd: `Data Analyst role requiring:\n- Advanced SQL and database skills\n- Python / R for analysis\n- Tableau or Power BI dashboards\n- Machine Learning basics\n- Statistical analysis\n- BI reporting\n- Communication with stakeholders`
    },
    "digital-marketer": {
      resume: `Sneha Patel\nMarketing Executive | Pune\nsneha@brandco.in\n\nEXPERIENCE\nMarketing Executive — BrandCo (2022–2024)\n- Managed Instagram and Facebook pages (50k+ followers)\n- Ran basic Google Ads campaigns (₹10k/month budget)\n- Created blog content for SEO\n- Sent weekly email newsletters via Mailchimp\n\nSKILLS: Social Media, Google Ads (basic), SEO (basic), Content Writing, Canva, Mailchimp\n\nEDUCATION: BBA Marketing — Pune University, 2022`,
      jd: `Digital Marketing Manager:\n- Advanced SEO/SEM strategy\n- Google Analytics 4 and Tag Manager\n- Paid ads: Google, Meta, LinkedIn (large budgets)\n- Email automation: HubSpot or Marketo\n- Data-driven campaign analysis\n- Content strategy and copywriting\n- Marketing funnel optimization`
    }
  };

  const sample = samplesByDomain[currentProfileKey] ||
                 samplesByDomain["software-developer"];
  document.getElementById("resumeTextArea").value = sample.resume;
  document.getElementById("jobDescArea").value    = sample.jd;
  resumeText = sample.resume;
  showNotif("📋", `Sample ${profile.label} data loaded!`);
  switchResumeTab("paste");
}

// ─── GITHUB FETCH ───────────────────────────────────────────
async function fetchGitHubData(username) {
  if (!username) return "";
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=20&sort=updated`)
    ]);
    if (userRes.ok && reposRes.ok) {
      const user  = await userRes.json();
      const repos = await reposRes.json();
      const langs = {};
      repos.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
      return `GitHub: ${user.name || username}, ${user.public_repos} repos, followers: ${user.followers}. Top languages: ${Object.entries(langs).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l,c])=>`${l}(${c})`).join(", ")}. Recent repos: ${repos.slice(0,5).map(r=>r.name+(r.description?" — "+r.description:"")).join("; ")}.`;
    }
  } catch(e) { /* silent */ }
  return "";
}

// ─── MAIN ANALYZE FUNCTION ─────────────────────────────────
// KEY FIX: currentProfileKey is used AS-IS if user manually selected.
//          Auto-detect from JD only fires if !userManuallySelectedDomain.
async function analyzeSkills() {
  const btn = document.getElementById("analyzeBtn");
  const effectiveResume = resumeText || document.getElementById("resumeTextArea")?.value || "";
  const jobDesc = document.getElementById("jobDescArea")?.value || "";
  const github  = document.getElementById("githubInput")?.value?.trim() || "";

  const apiKey = getApiKey();
  if (!apiKey || !apiKey.startsWith("sk-")) {
    showNotif("🔑", "Please enter your Anthropic API key above before analyzing.");
    const inp = document.getElementById("anthropicApiKey");
    if (inp) { inp.focus(); inp.style.borderColor = "var(--danger)"; setTimeout(() => inp.style.borderColor = "", 2500); }
    return;
  }

  if (!effectiveResume || effectiveResume.length < 50) {
    showNotif("⚠️", "Please add your resume text or upload a PDF first."); return;
  }
  if (!jobDesc || jobDesc.length < 30) {
    showNotif("⚠️", "Please paste a job description."); return;
  }

  // Only auto-update domain if user hasn't manually picked one
  if (!userManuallySelectedDomain) {
    const detected = detectJobDomain(jobDesc);
    if (detected) selectJobProfile(detected, false);
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> Analyzing…';
  document.getElementById("aiLoading").classList.add("show");
  switchTab("results");

  const profile = getJobProfile(currentProfileKey);
  const steps = [
    `🔍 Reading your resume…`,
    `🎯 Analyzing for ${profile.label} role…`,
    `🤖 Comparing with AI…`,
    `📊 Building skill radar…`,
    `🗺 Generating 30-day roadmap…`
  ];
  let stepIdx = 0;
  const stepEl = document.getElementById("aiLoadingStep");
  const stepTimer = setInterval(() => {
    if (stepEl) stepEl.textContent = steps[stepIdx++ % steps.length];
  }, 1400);

  try {
    const githubContext = github
      ? await fetchGitHubData(github.replace(/.*github\.com\//, "").split("/")[0])
      : "";
    const prompt = buildAnalysisPrompt(effectiveResume, jobDesc, githubContext, currentProfileKey);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    let text = (data.content || []).map(c => c.text || "").join("").replace(/```json|```/g,"").trim();
    // Find JSON object start/end robustly
    const jsonStart = text.indexOf("{");
    const jsonEnd   = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) text = text.slice(jsonStart, jsonEnd + 1);
    analysisData = JSON.parse(text);
    // Ensure domain is locked to what user chose
    analysisData.detectedDomain = profile.label;
  } catch(err) {
    console.warn("AI analysis failed, using fallback:", err);
    analysisData = generateFallbackAnalysis(jobDesc, currentProfileKey);
  }

  // Now fetch roadmap
  try {
    const rPrompt = buildRoadmapPrompt(analysisData, currentProfileKey);
    const rRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{ role: "user", content: rPrompt }]
      })
    });
    const rData = await rRes.json();
    let rText = (rData.content || []).map(c => c.text || "").join("").replace(/```json|```/g,"").trim();
    const rs = rText.indexOf("{"); const re = rText.lastIndexOf("}");
    if (rs !== -1 && re !== -1) rText = rText.slice(rs, re+1);
    roadmapData = JSON.parse(rText);
  } catch(err) {
    roadmapData = null;
  }

  clearInterval(stepTimer);
  document.getElementById("aiLoading").classList.remove("show");
  switchTab("results");
  renderResults(analysisData);
  btn.disabled = false;
  btn.innerHTML = "🔍 Analyze My Skills →";
  showNotif("✅", `Analysis complete for ${analysisData.candidateName}!`);
  // ── Streak & Gamification hook ──
  if (typeof onSkillAnalyzed === 'function') onSkillAnalyzed();
}

// ─── FALLBACK ANALYSIS ─────────────────────────────────────
function generateFallbackAnalysis(jobDesc, profileKey) {
  const profile = getJobProfile(profileKey || currentProfileKey);
  const skills  = profile.coreSkills;
  return {
    candidateName:  "Your Profile",
    detectedDomain: profile.label,
    matchScore:     58,
    experienceLevel:"Junior",
    summary: `Based on your resume, you have a solid foundation in ${profile.domain}. There are key skills to develop to fully match this ${profile.label} role.`,
    domainInsight: `The ${profile.domain} market is competitive — specialization and portfolio projects are key differentiators.`,
    salaryRange: "₹4–8 LPA",
    strengths: [
      { skill: skills[0] || "Core Skills",      level: "Good",   note: "Shown in resume" },
      { skill: skills[1] || "Communication",    level: "Strong", note: "Evident from profile" },
      { skill: "Problem Solving",               level: "Good",   note: "Demonstrated through projects" }
    ],
    gaps: [
      { skill: skills[2] || "Advanced Tools",   priority: "High",   note: `Required for ${profile.label}` },
      { skill: skills[3] || "Domain Expertise", priority: "High",   note: "Core requirement" },
      { skill: skills[4] || "Industry Tools",   priority: "Medium", note: "Industry standard" },
      { skill: "Portfolio / Case Studies",       priority: "Medium", note: "Expected for this domain" }
    ],
    partialMatches: [
      { skill: skills[5] || "Supporting Tool",  resumeLevel: "Beginner",  requiredLevel: "Intermediate" },
      { skill: skills[6] || "Domain Knowledge", resumeLevel: "Familiar",  requiredLevel: "Proficient" }
    ],
    radarData: profile.radarAxes.map((axis, i) => ({
      axis,
      candidate: [65,55,45,40,75,60][i] || 55,
      required:  [85,80,75,70,70,80][i] || 75
    })),
    jobRoles: profile.roles.slice(0, 4).map((role, i) => ({
      role, fit: [75,65,80,60][i], icon: profile.icon,
      reason: `Based on your profile for the ${profile.domain} sector.`
    })),
    keyMissingSkills: skills.slice(2, 6),
    topCertifications: skills.slice(0, 3).map(s => s + " Certification")
  };
}

// ─── RENDER RESULTS ────────────────────────────────────────
function renderResults(d) {
  const score = d.matchScore || 0;
  const scoreColor = score >= 75 ? "var(--accent)" : score >= 50 ? "var(--gold)" : "var(--danger)";
  const scoreLabel = score >= 75 ? "Excellent" : score >= 60 ? "Strong" : score >= 45 ? "Moderate" : "Needs Work";
  const profile = getJobProfile(currentProfileKey);

  const strengthsHTML = (d.strengths || []).map((s, i) => `
    <div class="result-skill-row reveal-item" style="animation-delay:${i * 0.08}s;">
      <div class="rsk-left">
        <span class="rsk-dot dot-strength"></span>
        <div>
          <div class="rsk-name">${s.skill}</div>
          <div class="rsk-note">${s.note || ""}</div>
        </div>
      </div>
      <span class="rsk-badge badge-strength">${s.level || "Match"}</span>
    </div>`).join("");

  const gapsHTML = (d.gaps || []).map((g, i) => `
    <div class="result-skill-row reveal-item" style="animation-delay:${i * 0.08}s;">
      <div class="rsk-left">
        <span class="rsk-dot dot-gap"></span>
        <div>
          <div class="rsk-name">${g.skill}</div>
          <div class="rsk-note">${g.note || ""}</div>
        </div>
      </div>
      <span class="rsk-badge badge-gap">${g.priority || "Gap"}</span>
    </div>`).join("");

  const partialHTML = (d.partialMatches || []).map((p, i) => `
    <div class="result-skill-row reveal-item" style="animation-delay:${i * 0.08}s;">
      <div class="rsk-left">
        <span class="rsk-dot dot-partial"></span>
        <div>
          <div class="rsk-name">${p.skill}</div>
          <div class="rsk-note">${p.resumeLevel} → ${p.requiredLevel}</div>
        </div>
      </div>
      <span class="rsk-badge badge-partial">Partial</span>
    </div>`).join("");

  const rolesHTML = (d.jobRoles || []).map((r, i) => `
    <div class="role-fit-card reveal-item" style="animation-delay:${i * 0.1}s;">
      <div class="role-fit-top">
        <span class="role-fit-icon">${r.icon || "💼"}</span>
        <div>
          <div class="role-fit-name">${r.role}</div>
          <div class="role-fit-pct" style="color:${r.fit >= 75 ? 'var(--accent)' : r.fit >= 55 ? 'var(--gold)' : 'var(--danger)'};">${r.fit}% fit</div>
        </div>
      </div>
      <div class="role-bar-track"><div class="role-bar-fill" data-w="${r.fit}" style="width:0%;background:${r.fit >= 75 ? 'var(--accent)' : r.fit >= 55 ? 'var(--gold)' : 'var(--danger)'};"></div></div>
      ${r.reason ? `<div class="role-fit-reason">${r.reason}</div>` : ""}
    </div>`).join("");

  const missingPills = (d.keyMissingSkills || []).map(s => `<span class="gap-pill">⚡ ${s}</span>`).join("");
  const certPills    = (d.topCertifications || []).map(s => `<span class="cert-pill">🏅 ${s}</span>`).join("");

  const circumference = 2 * Math.PI * 54;
  const dashOffset    = circumference - (score / 100) * circumference;

  // Roadmap weeks preview (if roadmap available)
  const roadmapPreview = roadmapData?.weeks?.length ? `
    <div class="res-section-card roadmap-preview-card">
      <div class="res-card-label">🗓 30-Day Roadmap Preview</div>
      <div class="roadmap-weeks-preview">
        ${roadmapData.weeks.slice(0, 2).map(w => `
          <div class="roadmap-week-mini">
            <div class="rwm-header">
              <span class="rwm-range">${w.weekRange}</span>
              <span class="rwm-hours">⏱ ${w.hoursPerWeek || 10} hrs/week</span>
            </div>
            <div class="rwm-topic">${w.topic}</div>
            <div class="rwm-skills">${(w.skills || []).map(s => `<span class="rwm-chip">${s}</span>`).join("")}</div>
          </div>`).join("")}
        <div class="roadmap-more-hint">+ ${roadmapData.weeks.length - 2} more weeks in full report →</div>
      </div>
    </div>` : "";

  document.getElementById("resultsContent").innerHTML = `
    <div class="results-page-wrap">

      <!-- DOMAIN LOCK BANNER -->
      <div class="domain-lock-banner">
        <span class="dlb-icon">${profile.icon}</span>
        <span class="dlb-text">Analyzed as <strong>${profile.label}</strong> — ${profile.domain} Domain</span>
        <span class="dlb-score" style="color:${scoreColor};">${score}% Match</span>
      </div>

      <!-- HERO BANNER -->
      <div class="res-hero">
        <div class="res-hero-left">
          <div class="res-hero-tag">${profile.icon} ${profile.label} · ${profile.domain}</div>
          <div class="res-hero-name">${d.candidateName}</div>
          <div class="res-hero-level">
            <span class="level-chip">${d.experienceLevel || "Junior"} Level</span>
            ${d.salaryRange ? `<span class="salary-chip">💰 ${d.salaryRange}</span>` : ""}
          </div>
          ${d.domainInsight ? `<div class="res-hero-insight">"${d.domainInsight}"</div>` : ""}
        </div>
        <div class="res-score-ring-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130" class="score-svg">
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
            <circle cx="65" cy="65" r="54" fill="none" stroke="${scoreColor}" stroke-width="10"
              stroke-linecap="round" stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1);"
              id="scoreRingCircle" data-offset="${dashOffset}"/>
          </svg>
          <div class="res-score-center">
            <div class="res-score-num" style="color:${scoreColor};" id="scoreAnimNum">0%</div>
            <div class="res-score-lbl">${scoreLabel}</div>
          </div>
        </div>
      </div>

      <!-- QUICK STATS ROW -->
      <div class="res-stats-row">
        <div class="res-stat-card">
          <div class="res-stat-val" style="color:var(--accent);">${(d.strengths||[]).length}</div>
          <div class="res-stat-label">Strengths</div>
        </div>
        <div class="res-stat-card">
          <div class="res-stat-val" style="color:var(--danger);">${(d.gaps||[]).length}</div>
          <div class="res-stat-label">Skill Gaps</div>
        </div>
        <div class="res-stat-card">
          <div class="res-stat-val" style="color:var(--gold);">${(d.partialMatches||[]).length}</div>
          <div class="res-stat-label">Partials</div>
        </div>
        <div class="res-stat-card">
          <div class="res-stat-val" style="color:#a78bfa;">${(d.jobRoles||[]).length}</div>
          <div class="res-stat-label">Role Matches</div>
        </div>
      </div>

      <!-- SUMMARY -->
      ${d.summary ? `
      <div class="res-summary-card">
        <div class="res-card-label">🧠 AI Summary</div>
        <div class="res-summary-text">${d.summary}</div>
      </div>` : ""}

      <!-- RADAR CHART -->
      <div class="res-section-card">
        <div class="res-card-label">📡 Skill Radar — ${profile.label}</div>
        <div class="res-radar-legend">
          <span class="legend-dot" style="background:rgba(0,212,200,0.7);"></span> You &nbsp;
          <span class="legend-dot" style="background:rgba(248,113,113,0.7);"></span> Required
        </div>
        <canvas id="radarChart" width="320" height="320" style="max-width:100%;display:block;margin:0 auto;"></canvas>
      </div>

      <!-- SKILLS GRID -->
      <div class="res-skills-grid">
        <div class="res-section-card">
          <div class="res-card-label" style="color:var(--accent);">✅ Your Strengths</div>
          <div class="res-skill-list">${strengthsHTML || '<div class="res-empty">No data</div>'}</div>
        </div>
        <div class="res-section-card">
          <div class="res-card-label" style="color:var(--danger);">❌ Skill Gaps</div>
          <div class="res-skill-list">${gapsHTML || '<div class="res-empty">No significant gaps!</div>'}</div>
          ${partialHTML ? `
          <div class="res-card-label" style="color:var(--gold);margin-top:1.25rem;">⚡ Partial Matches</div>
          <div class="res-skill-list">${partialHTML}</div>` : ""}
        </div>
      </div>

      <!-- MISSING SKILLS -->
      ${missingPills ? `
      <div class="res-section-card">
        <div class="res-card-label">🔑 Priority Skills to Learn</div>
        <div class="pill-cloud">${missingPills}</div>
      </div>` : ""}

      <!-- CERTIFICATIONS -->
      ${certPills ? `
      <div class="res-section-card">
        <div class="res-card-label">🏅 Recommended Certifications</div>
        <div class="pill-cloud">${certPills}</div>
      </div>` : ""}

      <!-- JOB ROLES -->
      ${rolesHTML ? `
      <div class="res-section-card">
        <div class="res-card-label">💼 Best-Fit Job Roles</div>
        <div class="role-fits-grid">${rolesHTML}</div>
      </div>` : ""}

      <!-- ROADMAP PREVIEW -->
      ${roadmapPreview}

      <!-- ACTION BUTTONS -->
      <div class="res-action-row">
        <button class="btn-primary" onclick="openReportWindow(analysisData, roadmapData, currentProfileKey)">
          🌐 Open Full Report →
        </button>
        <button class="btn-secondary" onclick="openWhatIf()">🧠 What-If Simulator</button>
        <button class="btn-secondary" onclick="openCompanyMatch()">🔍 Company Match</button>
        <button class="btn-secondary" onclick="openShareModal()">🌐 Share Results</button>
        <button class="btn-secondary" onclick="speakSummary()">🔊 Listen</button>
      </div>

    </div>`;

  // Animate score ring
  setTimeout(() => {
    const ring = document.getElementById("scoreRingCircle");
    if (ring) ring.style.strokeDashoffset = dashOffset;
    let n = 0;
    const numEl = document.getElementById("scoreAnimNum");
    const timer = setInterval(() => {
      n += Math.ceil(score / 40);
      if (n >= score) { n = score; clearInterval(timer); }
      if (numEl) numEl.textContent = n + "%";
    }, 35);
  }, 200);

  // Animate role bars
  setTimeout(() => {
    document.querySelectorAll(".role-bar-fill[data-w]").forEach(el => {
      el.style.transition = "width 1s ease";
      el.style.width = el.dataset.w + "%";
    });
  }, 400);

  // Draw radar chart
  setTimeout(() => drawRadar(d.radarData || []), 300);
  observeReveal();
}

// ─── RADAR CHART (Canvas) ──────────────────────────────────
function drawRadar(radarData) {
  const canvas = document.getElementById("radarChart");
  if (!canvas || !radarData.length) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
  const n = radarData.length;
  ctx.clearRect(0, 0, W, H);

  const angle = i => (i / n) * Math.PI * 2 - Math.PI / 2;
  const pt    = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(ratio => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, R * ratio);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(0,212,200,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Axes
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    const [x, y] = pt(i, R);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(0,212,200,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Required polygon
  ctx.beginPath();
  radarData.forEach((d, i) => {
    const [x, y] = pt(i, (d.required / 100) * R);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle   = "rgba(248,113,113,0.12)";
  ctx.strokeStyle = "rgba(248,113,113,0.75)";
  ctx.lineWidth   = 1.5;
  ctx.fill(); ctx.stroke();

  // Candidate polygon
  ctx.beginPath();
  radarData.forEach((d, i) => {
    const [x, y] = pt(i, (d.candidate / 100) * R);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle   = "rgba(0,212,200,0.18)";
  ctx.strokeStyle = "rgba(0,212,200,0.9)";
  ctx.lineWidth   = 2;
  ctx.fill(); ctx.stroke();

  // Dots + labels
  radarData.forEach((d, i) => {
    const [dx, dy] = pt(i, (d.candidate / 100) * R);
    ctx.beginPath(); ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00d4c8"; ctx.fill();

    const [lx, ly] = pt(i, R + 28);
    ctx.font = "bold 10px 'DM Sans', sans-serif";
    ctx.fillStyle  = "rgba(157,188,204,0.9)";
    ctx.textAlign  = Math.cos(angle(i)) > 0.1 ? "left" : Math.cos(angle(i)) < -0.1 ? "right" : "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.axis, lx, ly);
  });
}

// ─── SPEAK SUMMARY ─────────────────────────────────────────
function speakSummary() {
  if (!window.speechSynthesis || !analysisData) return;
  const text = `${analysisData.candidateName}, your match score is ${analysisData.matchScore} percent for ${getJobProfile(currentProfileKey).label}. ${analysisData.summary}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// ─── WHAT-IF MODAL ─────────────────────────────────────────
function openWhatIf()  { openModal("whatifModal"); }
function runWhatIf() {
  const skill = document.getElementById("whatifSkill")?.value?.trim();
  if (!skill || !analysisData) return;
  const boost = Math.floor(Math.random() * 12 + 5);
  const newScore = Math.min(100, (analysisData.matchScore || 0) + boost);
  const el = document.getElementById("whatifResult");
  if (el) {
    el.innerHTML = `Adding <strong>${skill}</strong> would boost your match from <span style="color:var(--danger)">${analysisData.matchScore}%</span> → <span style="color:var(--accent)">${newScore}%</span> (+${boost} pts).`;
    el.classList.add("show");
  }
}

// ─── COMPANY MATCH MODAL ───────────────────────────────────
function openCompanyMatch() { openModal("companyModal"); }
function runCompanyMatch() {
  const company = document.getElementById("companyInput")?.value?.trim();
  if (!company || !analysisData) return;
  const matchScore = Math.floor(Math.random() * 30 + 50);
  const el = document.getElementById("companyResult");
  if (el) {
    el.innerHTML = `Your profile matches <strong>${company}</strong> at approximately <strong style="color:var(--accent)">${matchScore}%</strong> for ${getJobProfile(currentProfileKey).label} roles.`;
    el.classList.add("show");
  }
}

// ─── SHARE MODAL ───────────────────────────────────────────
function openShareModal() {
  openModal("shareModal");
  const score = analysisData?.matchScore || 0;
  const shareText = `I just analyzed my skills with MapMySkills!\n✅ Match score: ${score}% for ${getJobProfile(currentProfileKey).label}\n🚀 AI-powered career gap analysis — try it free!\nBuilt by Bhargavi N | #CareerTech #AI`;
  const el = document.getElementById("shareText");
  if (el) el.value = shareText;
}
function copyShareText() {
  const el = document.getElementById("shareText");
  if (el) { navigator.clipboard?.writeText(el.value); showNotif("📋", "Copied to clipboard!"); }
}

// ─── MODAL UTILITIES ───────────────────────────────────────


document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("show");
});

// ─── CONTACT FORM ──────────────────────────────────────────
async function submitContactForm() {
  const firstName = document.getElementById("firstName")?.value?.trim();
  const email     = document.getElementById("contactEmail")?.value?.trim();
  const message   = document.getElementById("contactMessage")?.value?.trim();
  const reason    = document.getElementById("reason")?.value;
  if (!firstName || !email || !message) { showNotif("⚠️", "Please fill in name, email, and message."); return; }
  if (!email.includes("@") || !email.includes(".")) { showNotif("⚠️", "Enter a valid email address."); return; }
  const btn = document.getElementById("contactSubmitBtn");
  btn.disabled = true; btn.textContent = "⏳ Sending…";
  await new Promise(r => setTimeout(r, 1200));
  const ln      = document.getElementById("lastName")?.value?.trim() || "";
  const subject = encodeURIComponent(`MapMySkills Contact: ${reason || "General"} — from ${firstName} ${ln}`);
  const body    = encodeURIComponent(`Name: ${firstName} ${ln}\nEmail: ${email}\nReason: ${reason}\n\nMessage:\n${message}\n\n---\nSent via MapMySkills Contact Form`);
  window.location.href = `mailto:bhargavi2048@gmail.com?subject=${subject}&body=${body}`;
  showNotif("📧", "Opening email client…");
  btn.disabled = false; btn.textContent = "Send Message 🚀";
}

// ─── NOTIFICATION ──────────────────────────────────────────
function showNotif(icon, text) {
  const n = document.getElementById("notif");
  document.getElementById("notifIcon").textContent = icon;
  document.getElementById("notifText").textContent  = text;
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 4000);
}

// ─── SCROLL REVEAL ─────────────────────────────────────────
function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => io.observe(el));
}
observeReveal();

// ─── PROGRESS BAR ──────────────────────────────────────────
window.addEventListener("scroll", () => {
  const el = document.getElementById("progressBar");
  if (!el) return;
  const scrolled = document.documentElement.scrollTop;
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  el.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
});

// ─── PARTICLES ─────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.35 + 0.05
  }));
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,200,${p.opacity})`; ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}
initParticles();

// ─── DARK / LIGHT MODE TOGGLE ──────────────────────────────
let darkMode = true;
function toggleTheme() {
  darkMode = !darkMode;
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = darkMode ? "☀️" : "🌙";
}

// ─── COPY RESUME TEXT ──────────────────────────────────────
function copyResumeText() {
  const text = document.getElementById("resumeTextArea")?.value;
  if (text) { navigator.clipboard?.writeText(text); showNotif("📋", "Resume text copied!"); }
}

// ─── CLEAR FORM ────────────────────────────────────────────
function clearForm() {
  document.getElementById("resumeTextArea").value = "";
  document.getElementById("jobDescArea").value    = "";
  const githubEl = document.getElementById("githubInput");
  if (githubEl) githubEl.value = "";
  resumeText = "";
  userManuallySelectedDomain = false;
  resetDomainSelection();
  showNotif("🗑️", "Form cleared.");
}

// ─── INIT ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderJobSelector();
  if (window.speechSynthesis) speechSynthesis.getVoices();

  // PDF drag-drop
  const zone = document.getElementById("pdfDropZone");
  if (zone) {
    zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", e => {
      e.preventDefault(); zone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handlePdfUpload(file);
    });
  }

  // Auto-detect domain on JD input — only if NOT manually selected
  let jdTimer;
  const jdArea = document.getElementById("jobDescArea");
  if (jdArea) {
    jdArea.addEventListener("input", () => {
      clearTimeout(jdTimer);
      if (!userManuallySelectedDomain) {
        jdTimer = setTimeout(autoDetectDomain, 800);
      }
      // If user clears the field, reset manual lock
      if (!jdArea.value.trim()) resetDomainSelection();
    });
  }

  // Hamburger menu
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // Character count for resume
  const resumeArea = document.getElementById("resumeTextArea");
  const resumeCount = document.getElementById("resumeCharCount");
  if (resumeArea && resumeCount) {
    resumeArea.addEventListener("input", () => {
      resumeCount.textContent = `${resumeArea.value.length.toLocaleString()} chars`;
      resumeText = resumeArea.value;
    });
  }
});
