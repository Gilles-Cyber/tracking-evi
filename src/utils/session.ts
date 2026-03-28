export function getSessionId(): string {
  let sessionId = localStorage.getItem('gxn_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gxn_session_id', sessionId);
  }
  return sessionId;
}
