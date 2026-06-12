// Push fan-out: invoked by pg_net triggers (emergencies, new dogs, followed-dog
// activity). Resolves the audience server-side, writes notifications rows
// (Realtime streams them to the Alerts tab) and sends Expo pushes.
//
// Deploy:  supabase functions deploy push-fanout --no-verify-jwt
// Auth:    requests must carry the service role key as a Bearer token
//          (stored in Vault as push_fanout_key; see fn_notify_fanout()).
import { createClient } from 'npm:@supabase/supabase-js@2';

import { sendExpoPushes, type ExpoPushMessage } from '../_shared/expo.ts';

type FanoutPayload =
  | {
      type: 'emergency_created';
      emergency_id: string;
      dog_id: string | null;
      emergency_type: string;
      severity: string;
      lat: number;
      lng: number;
      reported_by: string;
    }
  | { type: 'new_dog_nearby'; dog_id: string; name: string; lat: number; lng: number; created_by: string }
  | {
      type: 'followed_dog_update';
      dog_id: string;
      activity_id: number;
      activity_type: string;
      actor_id: string | null;
      summary: string | null;
    };

interface Recipient {
  user_id: string;
  expo_push_token: string;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: FanoutPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad payload', { status: 400 });
  }

  let recipients: Recipient[] = [];
  let notificationType: string;
  let title: string;
  let body: string | null = null;
  let url: string;
  let channelId = 'default';

  switch (payload.type) {
    case 'emergency_created': {
      const { data, error } = await admin.rpc('users_to_notify', {
        p_lat: payload.lat,
        p_lng: payload.lng,
        p_kind: 'emergency_created',
        p_exclude: payload.reported_by,
      });
      if (error) return new Response(error.message, { status: 500 });
      recipients = data ?? [];
      notificationType = 'emergency_nearby';
      title = `🚨 ${titleCase(payload.emergency_type)} emergency nearby`;
      body = `Severity: ${payload.severity}. A street dog near you needs help.`;
      url = `/emergency/${payload.emergency_id}`;
      channelId = 'emergency';
      break;
    }
    case 'new_dog_nearby': {
      const { data, error } = await admin.rpc('users_to_notify', {
        p_lat: payload.lat,
        p_lng: payload.lng,
        p_kind: 'new_dog_nearby',
        p_exclude: payload.created_by,
      });
      if (error) return new Response(error.message, { status: 500 });
      recipients = data ?? [];
      notificationType = 'new_dog_nearby';
      title = `🐾 ${payload.name} was just added near you`;
      body = 'Take a look — maybe you can help feed them.';
      url = `/dog/${payload.dog_id}`;
      break;
    }
    case 'followed_dog_update': {
      const { data, error } = await admin.rpc('followers_to_notify', {
        p_dog_id: payload.dog_id,
        p_exclude: payload.actor_id,
      });
      if (error) return new Response(error.message, { status: 500 });
      recipients = data ?? [];
      const { data: dog } = await admin.from('dogs').select('name').eq('id', payload.dog_id).single();
      notificationType = 'followed_dog_update';
      title = `Update on ${dog?.name ?? 'a dog you follow'}`;
      body = payload.summary ?? titleCase(payload.activity_type);
      url = `/dog/${payload.dog_id}`;
      break;
    }
    default:
      return new Response('Unknown type', { status: 400 });
  }

  if (recipients.length === 0) {
    return Response.json({ notified: 0, pushed: 0 });
  }

  // Inbox rows — one per user (Realtime drives the in-app Alerts tab).
  const uniqueUserIds = [...new Set(recipients.map((r) => r.user_id))];
  const { error: insertError } = await admin.from('notifications').insert(
    uniqueUserIds.map((userId) => ({
      user_id: userId,
      type: notificationType,
      title,
      body,
      data: { url },
      push_sent: true,
    })),
  );
  if (insertError) console.error('notifications insert failed', insertError.message);

  // Pushes — one per device token.
  const messages: ExpoPushMessage[] = recipients.map((recipient) => ({
    to: recipient.expo_push_token,
    title,
    body: body ?? undefined,
    data: { url },
    channelId,
    sound: channelId === 'emergency' ? 'default' : null,
    priority: channelId === 'emergency' ? 'high' : 'default',
  }));
  const result = await sendExpoPushes(messages);

  if (result.deadTokens.length > 0) {
    await admin
      .from('push_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .in('expo_push_token', result.deadTokens);
  }

  if (payload.type === 'emergency_created') {
    await admin
      .from('emergency_reports')
      .update({ notified_count: uniqueUserIds.length })
      .eq('id', payload.emergency_id);
  }

  return Response.json({ notified: uniqueUserIds.length, pushed: result.sent });
});
