import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export type RecordingStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type JobStatus = 'idle' | 'preparing' | 'ready' | 'failed';

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compoundKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const recordings = pgTable(
  'recording',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Screen Recording'),
    muxUploadId: text('muxUploadId').notNull().unique(),
    muxAssetId: text('muxAssetId'),
    playbackId: text('playbackId'),
    status: text('status').$type<RecordingStatus>().notNull().default('uploading'),
    transcriptStatus: text('transcriptStatus').$type<JobStatus>().notNull().default('idle'),
    summaryStatus: text('summaryStatus').$type<JobStatus>().notNull().default('idle'),
    errorCode: text('errorCode'),
    durationSeconds: integer('durationSeconds'),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (recording) => ({
    userCreatedAtIdx: index('recording_user_created_at_idx').on(recording.userId, recording.createdAt),
    playbackIdUnique: uniqueIndex('recording_playback_id_unique').on(recording.playbackId),
    assetIdUnique: uniqueIndex('recording_mux_asset_id_unique').on(recording.muxAssetId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  recordings: many(recordings),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  user: one(users, {
    fields: [recordings.userId],
    references: [users.id],
  }),
}));

export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
