// Catalogue of integration adapters shown in System Status.
// Status here is what the browser knows; the gateway owns the real connection.
import type { IntegrationDescriptor } from './types';

export const integrations: IntegrationDescriptor[] = [
  { id: 'claude', name: 'Claude (Anthropic SDK)', category: 'llm', env: ['ANTHROPIC_API_KEY'], status: 'not_connected' },
  { id: 'openai', name: 'OpenAI', category: 'llm', env: ['OPENAI_API_KEY'], status: 'not_connected' },
  { id: 'google-drive', name: 'Google Drive', category: 'storage', env: ['GOOGLE_OAUTH_TOKEN'], status: 'not_connected' },
  { id: 'gmail', name: 'Gmail', category: 'email', env: ['GOOGLE_OAUTH_TOKEN'], status: 'not_connected' },
  { id: 'calendar', name: 'Google Calendar', category: 'calendar', env: ['GOOGLE_OAUTH_TOKEN'], status: 'not_connected' },
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'email', env: ['MS_GRAPH_TOKEN'], status: 'not_connected' },
  { id: 'slack', name: 'Slack', category: 'chat', env: ['SLACK_BOT_TOKEN'], status: 'not_connected' },
  { id: 'notion', name: 'Notion', category: 'knowledge', env: ['NOTION_TOKEN'], status: 'not_connected' },
  { id: 'github', name: 'GitHub', category: 'code', env: ['GITHUB_TOKEN'], status: 'not_connected' },
  { id: 'onedrive', name: 'OneDrive', category: 'storage', env: ['MS_GRAPH_TOKEN'], status: 'not_connected' },
];
