// The assistant's write surface.
//
// Reads are pre-fetched into the DASHBOARD DATA snapshot before the model is
// called, so tools exist only for things that CHANGE something. That keeps the
// dangerous surface small and easy to audit: three tools, and only one of them
// takes effect immediately.
//
//   draft_email               executes now — a draft in Gmail, never sent
//   propose_calendar_change   queued for Scott's approval
//   propose_drive_change      queued for Scott's approval
//
// The two "propose" tools deliberately cannot perform a write. All they can do
// is insert a pending row. Execution happens in the assistant-actions function
// after Scott approves, using the payload frozen at proposal time. So even a
// model that has been talked into something can only ever put a card in front
// of Scott — it cannot touch Drive or the calendar on its own.

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { createGmailDraft } from '../_shared/google-writes.ts';

export const TOOLS = [
  {
    name: 'draft_email',
    description:
      'Save a draft reply in Scott\'s Gmail. The draft waits in Gmail for him to read and send himself. ' +
      'You cannot send email — only draft it. Use this when Scott asks you to draft or write a reply. ' +
      'Quote the thread_id from the email data you were given when replying to an existing conversation.',
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address.' },
        subject: { type: 'string', description: 'Subject line.' },
        body: { type: 'string', description: 'The message, in Scott\'s warm, plain-English voice.' },
        thread_id: {
          type: 'string',
          description: 'The Gmail thread id, when replying to an existing conversation.',
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'propose_calendar_change',
    description:
      'Propose a change to Scott\'s calendar. This does NOT happen immediately — it goes to his approval ' +
      'list on the dashboard and only takes effect once he approves it. Tell him you have put it there.',
    input_schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['calendar_create', 'calendar_update', 'calendar_delete'],
          description: 'Whether to add, change or cancel an event.',
        },
        summary: {
          type: 'string',
          description: 'One plain sentence describing the change, written for Scott to read and approve.',
        },
        title: { type: 'string', description: 'Event title, for create and update.' },
        start: { type: 'string', description: 'Start time, ISO 8601 with timezone offset.' },
        end: { type: 'string', description: 'End time, ISO 8601 with timezone offset.' },
        location: { type: 'string', description: 'Optional location.' },
        description: { type: 'string', description: 'Optional notes on the event.' },
        event_id: { type: 'string', description: 'Existing event id, required for update and delete.' },
      },
      required: ['kind', 'summary'],
    },
  },
  {
    name: 'propose_drive_change',
    description:
      'Propose a change to Scott\'s Google Drive. This does NOT happen immediately — Scott asked that every ' +
      'Drive write wait for his approval, so it goes to his approval list and only runs once he approves. ' +
      'Removals go to the bin, never permanent deletion. Tell him you have put it there.',
    input_schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['drive_create_folder', 'drive_rename', 'drive_move', 'drive_trash'],
          description: 'What kind of change to make.',
        },
        summary: {
          type: 'string',
          description: 'One plain sentence describing the change, written for Scott to read and approve.',
        },
        name: { type: 'string', description: 'New name, for create folder and rename.' },
        file_id: { type: 'string', description: 'The file or folder id, from the Drive data you were given.' },
        parent_id: { type: 'string', description: 'Parent folder id, when creating inside a folder.' },
        new_parent_id: { type: 'string', description: 'Destination folder id, for a move.' },
        old_parent_id: { type: 'string', description: 'Current folder id, for a move.' },
      },
      required: ['kind', 'summary'],
    },
  },
];

/** Queue a change for Scott to approve. Never performs the change itself. */
async function propose(
  admin: SupabaseClient,
  userId: string,
  input: Record<string, unknown>,
): Promise<string> {
  const kind = input.kind;
  const summary = input.summary;

  if (typeof kind !== 'string' || typeof summary !== 'string' || !summary.trim()) {
    return 'That change could not be queued: it needs a kind and a plain-English summary.';
  }

  // Everything except the two control fields becomes the frozen payload.
  const payload: Record<string, unknown> = { ...input };
  delete payload.kind;
  delete payload.summary;

  const { error } = await admin.from('assistant_actions').insert({
    user_id: userId,
    kind,
    summary,
    payload,
  });

  if (error) return 'That change could not be added to the approval list.';

  return `Queued for approval: "${summary}". ` +
    'Nothing has changed yet — it is waiting on the dashboard for Scott to approve.';
}

/**
 * Run one tool call and return the text the model sees as its result.
 *
 * Every branch returns a string rather than throwing, so a failing tool becomes
 * something the assistant can explain to Scott instead of a 500.
 */
export async function runTool(
  admin: SupabaseClient,
  userId: string,
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case 'draft_email': {
      const to = input.to;
      const subject = input.subject;
      const body = input.body;
      if (typeof to !== 'string' || typeof subject !== 'string' || typeof body !== 'string') {
        return 'The draft needs a recipient, a subject and a message.';
      }
      const result = await createGmailDraft(admin, userId, {
        to,
        subject,
        body,
        thread_id: typeof input.thread_id === 'string' ? input.thread_id : undefined,
      });
      return result.detail;
    }

    case 'propose_calendar_change':
    case 'propose_drive_change':
      return propose(admin, userId, input);

    default:
      return 'That tool does not exist.';
  }
}
