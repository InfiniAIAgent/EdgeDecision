exports.up = function(knex) {
  return knex.schema
    // Organizations (Multi-tenancy)
    .createTable('organizations', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('slug').unique().notNullable();
      table.string('plan').defaultTo('free'); // free, starter, growth, enterprise
      table.string('stripe_customer_id').unique();
      table.string('stripe_subscription_id');
      table.timestamp('trial_ends_at');
      table.jsonb('settings').defaultTo('{}');
      table.timestamps(true, true);
    })
    
    // Users
    .createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('first_name');
      table.string('last_name');
      table.string('avatar_url');
      table.boolean('email_verified').defaultTo(false);
      table.timestamp('last_login_at');
      table.timestamps(true, true);
    })
    
    // Organization Members (Many-to-Many)
    .createTable('organization_members', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.enum('role', ['owner', 'admin', 'member', 'viewer']).notNullable();
      table.timestamps(true, true);
      table.unique(['organization_id', 'user_id']);
    })
    
    // Integrations
    .createTable('integrations', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.enum('platform', ['shopify', 'facebook', 'google', 'tiktok', 'klaviyo', 'instagram']).notNullable();
      table.string('status').defaultTo('connected'); // connected, disconnected, error
      table.jsonb('credentials'); // Encrypted
      table.jsonb('config').defaultTo('{}');
      table.timestamp('last_synced_at');
      table.timestamp('next_sync_at');
      table.timestamps(true, true);
      table.unique(['organization_id', 'platform']);
    })
    
    // Analytics Data Cache
    .createTable('analytics_cache', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.string('metric_type').notNullable(); // revenue, orders, customers, etc.
      table.date('date').notNullable();
      table.jsonb('data').notNullable();
      table.string('source'); // shopify, facebook, etc.
      table.timestamps(true, true);
      table.index(['organization_id', 'metric_type', 'date']);
    })
    
    // Attribution Data
    .createTable('attribution_data', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.string('order_id').notNullable();
      table.string('channel').notNullable(); // facebook, google, tiktok, etc.
      table.string('campaign_id');
      table.string('ad_set_id');
      table.string('ad_id');
      table.decimal('revenue', 12, 2);
      table.decimal('cost', 12, 2);
      table.string('attribution_model').defaultTo('last_click');
      table.timestamp('order_date');
      table.jsonb('metadata').defaultTo('{}');
      table.timestamps(true, true);
      table.index(['organization_id', 'channel', 'order_date']);
    })
    
    // AI Chat History
    .createTable('ai_chat_history', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('message').notNullable();
      table.text('response').notNullable();
      table.string('conversation_id');
      table.jsonb('context').defaultTo('{}');
      table.timestamps(true, true);
      table.index(['organization_id', 'conversation_id']);
    })
    
    // Webhooks
    .createTable('webhooks', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.string('source'); // stripe, shopify, etc.
      table.string('event_type');
      table.jsonb('payload');
      table.string('status').defaultTo('pending'); // pending, processed, failed
      table.timestamps(true, true);
      table.index(['organization_id', 'source', 'status']);
    })
    
    // Billing History
    .createTable('billing_history', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
      table.string('stripe_invoice_id').unique();
      table.decimal('amount', 12, 2).notNullable();
      table.string('currency').defaultTo('usd');
      table.string('status'); // paid, pending, failed
      table.timestamp('period_start');
      table.timestamp('period_end');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('billing_history')
    .dropTableIfExists('webhooks')
    .dropTableIfExists('ai_chat_history')
    .dropTableIfExists('attribution_data')
    .dropTableIfExists('analytics_cache')
    .dropTableIfExists('integrations')
    .dropTableIfExists('organization_members')
    .dropTableIfExists('users')
    .dropTableIfExists('organizations');
};
