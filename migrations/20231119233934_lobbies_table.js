/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('lobbies', (table) => {
        table.increments('id').primary();
        table
            .integer('match_id')
            .unsigned()
            .references('matches.id')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.smallint('progress').notNullable().unsigned().defaultTo(0);
        table.string('status');
        table.boolean('is_done').notNullable().defaultTo(false);
        table.boolean('on_hold').notNullable().defaultTo(false);
        table.string('visibility').notNullable();
        table.string('password');
        table.timestamp('creation_time').defaultTo(knex.fn.now());
        table.timestamp('expiration_time');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('lobbies');
};
