/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.smallint('level').notNullable();
        table.bigint('experience');
        table.bigInteger('coins');
        table.integer('games_played');
        table.integer('games_hosted');
        table.string('email').notNullable().unique();
        table.timestamp('creation_time').defaultTo(knex.fn.now());
        table.timestamp('last_played');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
