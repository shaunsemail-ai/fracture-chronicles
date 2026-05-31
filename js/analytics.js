// Analytics — per-player quiz performance tracking
// Stored separately from game saves so it persists even if a save is deleted.
// Parents can access this from the Stats screen on the main menu.

const Analytics = (() => {
  const STORAGE_KEY = 'fracture_analytics_v1';

  // ── Persistence ───────────────────────────────────────────────
  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { players: {} };
    } catch { return { players: {} }; }
  }

  function saveData(d) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e) {
      console.warn('Analytics save failed:', e);
    }
  }

  function ensurePlayer(data, profileName) {
    if (!data.players[profileName]) {
      data.players[profileName] = {
        totalPlaytime: 0,           // seconds
        sessions: [],               // [{ date, duration, topicsTouched: [] }]
        currentSessionStart: null,
        questions: {},              // [qHash] -> QuestionRecord
        topics: {},                 // [topicId] -> TopicRecord
      };
    }
    return data.players[profileName];
  }

  // ── Simple hash for question text ─────────────────────────────
  function hashQuestion(topicId, questionText) {
    let h = 0;
    const s = topicId + '|' + questionText;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(36);
  }

  // ── Session tracking ──────────────────────────────────────────
  let _currentProfile = null;
  let _sessionStartTime = null;
  let _sessionTopics = new Set();

  function startSession(profileName) {
    _currentProfile = profileName;
    _sessionStartTime = Date.now();
    _sessionTopics = new Set();
    const data = getData();
    ensurePlayer(data, profileName);
    data.players[profileName].currentSessionStart = _sessionStartTime;
    saveData(data);
  }

  function endSession(profileName) {
    if (!_sessionStartTime) return;
    const duration = Math.floor((Date.now() - _sessionStartTime) / 1000);
    const data = getData();
    const p = ensurePlayer(data, profileName || _currentProfile);
    p.totalPlaytime = (p.totalPlaytime || 0) + duration;
    p.sessions.push({
      date: new Date().toISOString(),
      duration,
      topicsTouched: [..._sessionTopics],
    });
    // Keep last 100 sessions
    if (p.sessions.length > 100) p.sessions = p.sessions.slice(-100);
    p.currentSessionStart = null;
    saveData(data);
    _sessionStartTime = null;
    _sessionTopics = new Set();
  }

  // Called every minute of playtime
  function tickPlaytime(profileName, seconds) {
    const data = getData();
    const p = ensurePlayer(data, profileName);
    p.totalPlaytime = (p.totalPlaytime || 0) + seconds;
    saveData(data);
  }

  // ── Record a quiz answer ──────────────────────────────────────
  // questionText: the question string
  // choices: array of choice strings
  // correctIdx: index of correct answer
  // playerIdx: index player chose
  function recordAnswer(profileName, topicId, subject, questionText, choices, correctIdx, playerIdx) {
    const wasCorrect = playerIdx === correctIdx;
    const qHash = hashQuestion(topicId, questionText);
    _sessionTopics.add(topicId);

    const data = getData();
    const p = ensurePlayer(data, profileName);

    // Question record
    if (!p.questions[qHash]) {
      p.questions[qHash] = {
        topicId, subject,
        questionText,
        choices,
        correctIdx,
        attempts: [],
      };
    }
    p.questions[qHash].attempts.push({
      date: new Date().toISOString(),
      playerIdx,
      wasCorrect,
    });

    // Topic aggregate
    if (!p.topics[topicId]) {
      p.topics[topicId] = { subject, topicId, name: topicId, attempts: 0, correct: 0 };
    }
    p.topics[topicId].attempts++;
    if (wasCorrect) p.topics[topicId].correct++;

    saveData(data);
    return wasCorrect;
  }

  // Set topic name from curriculum (call once per topic when first encountered)
  function setTopicName(profileName, topicId, name, subject) {
    const data = getData();
    const p = ensurePlayer(data, profileName);
    if (!p.topics[topicId]) p.topics[topicId] = { subject, topicId, name, attempts: 0, correct: 0 };
    else p.topics[topicId].name = name;
    saveData(data);
  }

  // ── Queries ───────────────────────────────────────────────────
  function getProfileStats(profileName) {
    const data = getData();
    const p = data.players[profileName];
    if (!p) return null;

    const topics = Object.values(p.topics).map(t => ({
      ...t,
      pct: t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : null,
      strength: t.attempts === 0 ? 'untested'
        : t.correct / t.attempts >= 0.85 ? 'strong'
        : t.correct / t.attempts >= 0.70 ? 'good'
        : t.correct / t.attempts >= 0.50 ? 'weak'
        : 'struggling',
    }));

    // Group by subject
    const bySubject = {};
    for (const t of topics) {
      if (!bySubject[t.subject]) bySubject[t.subject] = [];
      bySubject[t.subject].push(t);
    }

    // Overall per subject
    const subjectSummary = {};
    for (const [subj, tops] of Object.entries(bySubject)) {
      const tested = tops.filter(t => t.attempts > 0);
      const totalAttempts = tested.reduce((s, t) => s + t.attempts, 0);
      const totalCorrect = tested.reduce((s, t) => s + t.correct, 0);
      subjectSummary[subj] = {
        pct: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null,
        topicsTested: tested.length,
        topicsTotal: tops.length,
      };
    }

    return {
      profileName,
      totalPlaytime: p.totalPlaytime || 0,
      sessionCount: p.sessions.length,
      lastSession: p.sessions.length > 0 ? p.sessions[p.sessions.length - 1].date : null,
      topics,
      bySubject,
      subjectSummary,
    };
  }

  function getWeakTopics(profileName, threshold = 0.70) {
    const stats = getProfileStats(profileName);
    if (!stats) return [];
    return stats.topics
      .filter(t => t.attempts > 0 && (t.correct / t.attempts) < threshold)
      .sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts));
  }

  // Returns all question attempts for a topic — wrong answers first
  function getTopicQuestionHistory(profileName, topicId) {
    const data = getData();
    const p = data.players[profileName];
    if (!p) return [];
    return Object.values(p.questions)
      .filter(q => q.topicId === topicId)
      .map(q => {
        const attempts = q.attempts.length;
        const correct = q.attempts.filter(a => a.wasCorrect).length;
        const lastAttempt = q.attempts[q.attempts.length - 1];
        return {
          ...q,
          totalAttempts: attempts,
          totalCorrect: correct,
          pct: Math.round((correct / attempts) * 100),
          lastWasCorrect: lastAttempt?.wasCorrect,
          lastPlayerAnswer: lastAttempt ? q.choices[lastAttempt.playerIdx] : null,
          correctAnswer: q.choices[q.correctIdx],
        };
      })
      .sort((a, b) => a.pct - b.pct); // worst first
  }

  // All wrong answers across all topics for a profile
  function getAllWrongAnswers(profileName) {
    const data = getData();
    const p = data.players[profileName];
    if (!p) return [];
    const results = [];
    for (const q of Object.values(p.questions)) {
      const wrongAttempts = q.attempts.filter(a => !a.wasCorrect);
      if (wrongAttempts.length > 0) {
        results.push({
          topicId: q.topicId,
          subject: q.subject,
          questionText: q.questionText,
          correctAnswer: q.choices[q.correctIdx],
          wrongCount: wrongAttempts.length,
          totalAttempts: q.attempts.length,
          lastWrongAnswer: q.choices[wrongAttempts[wrongAttempts.length - 1].playerIdx],
        });
      }
    }
    return results.sort((a, b) => b.wrongCount - a.wrongCount);
  }

  // ── Text report (for clipboard export) ───────────────────────
  function exportReport(profileName) {
    const stats = getProfileStats(profileName);
    if (!stats) return 'No data for ' + profileName;

    const mins = Math.floor(stats.totalPlaytime / 60);
    const secs = stats.totalPlaytime % 60;
    let out = `FRACTURE — STATS REPORT\n`;
    out += `Player: ${profileName}\n`;
    out += `Total Play Time: ${mins}m ${secs}s across ${stats.sessionCount} sessions\n`;
    if (stats.lastSession) out += `Last Session: ${new Date(stats.lastSession).toLocaleDateString()}\n`;
    out += `\n`;

    for (const [subj, summary] of Object.entries(stats.subjectSummary)) {
      const label = subj.charAt(0).toUpperCase() + subj.slice(1);
      out += `── ${label} ──────────────────────\n`;
      out += `Overall: ${summary.pct !== null ? summary.pct + '%' : 'Not tested'} (${summary.topicsTested}/${summary.topicsTotal} topics covered)\n\n`;
      const topics = (stats.bySubject[subj] || []).sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1));
      for (const t of topics) {
        const bar = t.pct !== null
          ? '[' + '█'.repeat(Math.floor(t.pct / 10)) + '░'.repeat(10 - Math.floor(t.pct / 10)) + ']'
          : '[not tested]';
        out += `  ${t.name.padEnd(35)} ${bar} ${t.pct !== null ? t.pct + '%' : ''} (${t.correct}/${t.attempts})\n`;
      }
      out += `\n`;
    }

    const weak = getWeakTopics(profileName, 0.70);
    if (weak.length > 0) {
      out += `── NEEDS REVIEW BEFORE TEST ───────\n`;
      for (const t of weak) {
        out += `  ⚠ ${t.name} — ${t.pct}% correct (${t.correct}/${t.attempts})\n`;
        const qs = getTopicQuestionHistory(profileName, t.topicId).slice(0, 3);
        for (const q of qs) {
          if (!q.lastWasCorrect) {
            out += `    Q: ${q.questionText}\n`;
            out += `       Wrong: "${q.lastPlayerAnswer}"  Right: "${q.correctAnswer}"\n`;
          }
        }
      }
      out += `\n`;
    }

    return out;
  }

  function copyReportToClipboard(profileName) {
    const report = exportReport(profileName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report).catch(() => {});
    }
    return report;
  }

  // ── All profiles ──────────────────────────────────────────────
  function getAllProfiles() {
    const data = getData();
    return Object.keys(data.players);
  }

  function clearProfileData(profileName) {
    const data = getData();
    delete data.players[profileName];
    saveData(data);
  }

  return {
    startSession, endSession, tickPlaytime,
    recordAnswer, setTopicName,
    getProfileStats, getWeakTopics,
    getTopicQuestionHistory, getAllWrongAnswers,
    exportReport, copyReportToClipboard,
    getAllProfiles, clearProfileData,
  };
})();
