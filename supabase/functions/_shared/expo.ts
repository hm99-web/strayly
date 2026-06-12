/** Minimal Expo Push API client (chunked sends + ticket inspection). */

export interface ExpoPushMessage {
  to: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  channelId?: string;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

export interface PushSendResult {
  sent: number;
  /** Tokens Expo reported as DeviceNotRegistered — revoke these. */
  deadTokens: string[];
}

export async function sendExpoPushes(messages: ExpoPushMessage[]): Promise<PushSendResult> {
  const deadTokens: string[] = [];
  let sent = 0;

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(chunk),
      });
      if (!response.ok) {
        console.error('expo push send failed', response.status, await response.text());
        continue;
      }
      const json = (await response.json()) as { data?: ExpoPushTicket[] };
      (json.data ?? []).forEach((ticket, index) => {
        if (ticket.status === 'ok') {
          sent += 1;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          deadTokens.push(chunk[index].to);
        } else {
          console.warn('expo push ticket error', ticket.message, ticket.details?.error);
        }
      });
    } catch (error) {
      console.error('expo push chunk failed', error);
    }
  }

  return { sent, deadTokens };
}
